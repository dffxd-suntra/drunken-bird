// 包含min，不包含max
// precision: 精度,0为整数,1为一位小数,以此类推
function randomInt(min, max, precision = 0) {
    precision = Decimal.pow(10, precision);
    min = Decimal.mul(min, precision);
    max = Decimal.mul(max, precision);
    return Decimal.floor(Decimal.random() * new Decimal(max).minus(min)).add(min).div(precision);
}

function range(start, end, step = 1) {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    let list = [];
    while (start < end) {
        list.push(start);
        start += step;
    }
    return list;
}

function sjd(x, y, angle, bevel) {
    let rd = Decimal.mul(angle, Math.PI).div(180);
    let xm = Decimal.cos(rd).add(bevel);
    let ym = Decimal.sin(rd).add(bevel);
    return { x: Decimal.add(x, xm), y: Decimal.add(y, ym) };
}

class DrunkenBird {
    // 这个喝醉的鸟在w维空间里,而它的家在w维坐标系中的homePos里
    constructor(w, homePos, allowNegativePos = true) {
        // 维度
        this.w = w;
        // 家的坐标
        this.homePos = homePos;
        // 是否允许负坐标
        this.allowNegativePos = allowNegativePos;
        // 鸟的坐标
        this.birdPos = [];
        // 每一步的动作
        this.steps = [{ id: 0, dis: 0, birdPos: [] }];
        // 总共运行几步
        this.total = 1;

        // 初始化维度
        for (let i in range(this.w)) {
            this.birdPos.push(0);
            this.steps[0].birdPos.push(0);
        }

        this.steps[0].inHome = this.checkIfHome();
    }
    // 相对更改鸟的坐标
    moveBirdRelatively({ step = this.total, id, dis }) {
        // 更改鸟的坐标
        this.birdPos[id] += dis;

        this.total++;

        // 修正坐标
        if (!this.allowNegativePos) {
            this.birdPos[id] = Math.max(this.birdPos[id], 0);
        }

        // 更新步数
        this.steps[step] = { id, dis, birdPos: [], inHome: this.checkIfHome() };
        // 不直接赋值避免浅复制
        for (let i = 0; i < this.w; i++) {
            this.steps[step].birdPos[i] = this.birdPos[i];
        }

        // 返回是否到家
        return this.steps[step].inHome;
    }
    // 随机移动 times 步
    randomMove(times) {
        for (let i = 0; i < times; i++) {
            let id = randomInt(0, this.w);
            let dis = (randomInt(0, 2) == 0 ? -1 : 1);
            if (this.moveBirdRelatively({ id, dis })) {
                break;
            }
        }
        return this.steps[this.total - 1].inHome;
    }
    // 检测是否到家
    checkIfHome() {
        for (let i = 0; i < this.w; i++) {
            if (this.homePos[i] != this.birdPos[i]) {
                return false;
            }
        }
        return true;
    }
    // 获取数据
    get(step) {
        return this.steps[step];
    }
}

let started = false;

let page = {
    init() {
        page.table = $("#steps").DataTable();

        // 基于准备好的dom，初始化echarts实例
        page.chart = echarts.init($("#chart").get(0));

        // 自动改变大小
        $(window).resize(function () {
            page.chart.resize();
        });

        $("#start").click(page.start);
    },
    start() {
        try {
            if (started) {
                return;
            }
            let w = parseInt($("#w").val());
            let times = parseInt($("#times").val());
            let homePos = $("#home").val().split(" ");
            let allowNegativePos = $("#allowNegativePos").prop("checked");

            if (homePos.length != 2 || !w || !times) {
                throw new Error("ERROR: please format your input");
            }

            page.bird = new DrunkenBird(w, homePos, allowNegativePos);

            page.bird.randomMove(times);

            page.showChart(page.bird.birdPos, page.bird.homePos);

            page.showList();
        } catch (error) {
            alert(error.message);
        } finally {

        };
    },
    showChart(birdPos, homePos) {
        // 绘制图表
        page.chart.setOption({
            title: {
                text: "喝醉的小鸟2d展示"
            },
            tooltip: {
                trigger: "item"
            },
            xAxis: {
                name: "x"
            },
            yAxis: {
                name: "y"
            },
            series: [
                {
                    type: "scatter",
                    symbol: "path://M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z",
                    symbolSize: 32,
                    tooltip: {
                        formatter: function ({ data }) {
                            return `小鸟:<br />x:${data[0]} y:${data[1]}`;
                        }
                    },
                    data: [
                        [birdPos[0], birdPos[1]]
                    ],
                    clip: false
                },
                {
                    type: "scatter",
                    symbol: "path://M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207l-5-5-5 5V13.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7.207Z",
                    symbolSize: 32,
                    tooltip: {
                        formatter: function ({ data }) {
                            return `家:<br />x:${data[0]} y:${data[1]}`;
                        }
                    },
                    data: [
                        [homePos[0], homePos[1]]
                    ],
                    clip: false
                }
            ]
        });
    },
    showList() {
        page.table.destroy();
        $("#stepsHead").html(
            $(`<tr></tr>`).append(
                `<th>步骤</th>
                <th>维度</th>
                <th>距离</th>`,
                range(page.bird.w).map(value => $(`<th></th>`).text("维度 " + value)),
                `<th>在家</th>`
            )
        );
        page.table = $("#steps").DataTable({
            data: page.bird.steps.map(function ({ id, dis, birdPos, inHome }, index) {
                let list = [index, id, dis];
                for (let i in birdPos) {
                    list.push(birdPos[i]);
                }
                list.push(inHome);
                return list;
            })
        });
    }
};

page.init();

Decimal.set({
    precision: 1000,
    defaults: true
})

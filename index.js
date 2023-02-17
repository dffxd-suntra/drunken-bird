// 包含min，不包含max
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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
        for (let i = 0; i < this.w; i++) {
            this.birdPos.push(0);
            this.steps[0].birdPos.push(0);
        }
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
        this.steps[step] = { id, dis, birdPos: [] };
        // 不直接赋值避免浅复制
        for (let i = 0; i < this.w; i++) {
            this.steps[step].birdPos[i] = this.birdPos[i];
        }

        // 返回是否到家
        return this.checkIfHome();
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
        return this.checkIfHome();
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

            let bird = page.bird = new DrunkenBird(w, homePos, allowNegativePos);

            bird.randomMove(times);

            let option = {
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
                series: []
            };

            option.series.push({
                type: "effectScatter",
                tooltip: {
                    formatter: function ({ data }) {
                        console.log(arguments);
                        return `小鸟:<br />x:${data[0]} y:${data[1]}`;
                    }
                },
                data: [
                    [bird.birdPos[0], bird.birdPos[1]]
                ],
                clip: false
            }, {
                type: "effectScatter",
                tooltip: {
                    formatter: function ({ data }) {
                        console.log(arguments);
                        return `家:<br />x:${data[0]} y:${data[1]}`;
                    }
                },
                data: [
                    [bird.homePos[0], bird.homePos[1]]
                ],
                clip: false
            });

            // 绘制图表
            chart.setOption(option);

            page.showList();
        } catch (error) {
            alert(error.message);
        } finally {

        };
    },
    showList() {
        let lis = page.bird.steps.map(function ({id, dis, birdPos}) {
            let li = $(`<li class="list-group-item"></li>`);
            li.text(`维度 ${id} 移动 ${dis} 格`);
            return li;
        });
        $("#steps").html(lis);
    }
};

$("#start").click(page.start);

// 基于准备好的dom，初始化echarts实例
var chart = echarts.init($("#chart").get(0));

// 自动改变大小
$(window).resize(function () {
    chart.resize();
});
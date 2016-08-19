define(function(require, exports, module) {

  var Bird = require('./bird');
  var Sky = require('./sky');
  var Land = require('./land');
  var Pipe = require('./pipe');
  var loadImgs = require('./load_imgs');
  var renderView = require('./renderView');

  var cvs = document.getElementById('cvs');
  var ctx = cvs.getContext('2d');

  // main() 函数依赖了 load_imgs 文件模块中的 images 对象
  function main(images) {
    // 模型（程序运行的数据）
    var model = {
      displayObjects: [], // 屏幕上的显示对象
      gameOver: false, // 游戏结束
      skys: [],
      lands: [],
      pipes: [],
    };
    // 创建鸟
    var bird = new Bird(ctx, images['birds']);
    // 创建天空
    for (var i = 0; i < 2; i++) {
      var sky = new Sky(ctx, 800 * i, images['sky'], -0.1);
      model.skys.push(sky);
    }
    // 创建大地
    for (var i = 0; i < 4; i++) {
      var land = new Land(ctx, 336 * i, images['land'], -0.2);
      model.lands.push(land)
    }
    // 创建管子
    for (var i = 0; i < 4; i++) {
      var pipe = new Pipe(ctx, 400 + 800 / 4 * i, images['pipe1'], images['pipe2'], -0.2);
      model.pipes.push(pipe)
    }

    var controllers = {
      onFly: function() {
        bird.speed = -0.3;
      },
      onRenderedFrame: function() { // 当渲染结束时执行
        if (bird.y < 0 || bird.y > 500) {
          model.gameOver = true;
        }
        for (var i = 0; i < model.skys.length; i++) { // 当天空到最左侧时的处理
          var target = model.skys[i];
          if (target.x < -800) {
            target.build();
          }
        }
        for (var i = 0; i < model.lands.length; i++) { // 当大地到最左侧时的处理
          var target = model.lands[i];
          if (target.x < -336) {
            target.build();
          }
        }
        for (var i = 0; i < model.pipes.length; i++) { // 当管子到最左侧时的处理
          var target = model.pipes[i];
          if (target.x < -52) {
            target.build();
          }
        }
        if (ctx.isPointInPath(bird.x, bird.y)) {
          model.gameOver = true;
        }
        ctx.beginPath();
      },
      onEnterFrame: function() { // 当一帧开始时执行
        model.displayObjects = [];
        model.displayObjects = model.displayObjects.concat(model.skys);
        model.displayObjects = model.displayObjects.concat(model.pipes);
        model.displayObjects = model.displayObjects.concat(model.lands);
        model.displayObjects.push(bird);
      }
    };

    cvs.addEventListener('click', function() {
      controllers.onFly();
    });

    function loop(lastTime) {
      var now = Date.now();
      var dt = now - lastTime;

      controllers.onEnterFrame(); // 一帧进入时执行

      renderView(ctx, model, dt); // 把渲染交给renderView去管

      controllers.onRenderedFrame(); // 渲染结束时执行

      var loopWithTime = loop.bind(window, now);
      if (!model.gameOver) {
        if (true) {
          requestAnimationFrame(loopWithTime)
        }
      }
    }

    loop(Date.now());
  }

  // 当所有图片加载成功之后执行 main 函数

  // 封装一个模块，支持传入一个图片路径，当所有图片加载完成，执行回调函数
  loadImgs(['birds', 'land', 'pipe1', 'pipe2', 'sky'], function (images) {
    main(images);
  });

})

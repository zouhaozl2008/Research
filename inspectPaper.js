var canvas = document.querySelector('canvas');  
var ctx = canvas.getContext('2d');  
//操作记录
var drawOpArry = [];
//批阅区域定义
var rectArry = [
{x1:158,y1:264,x2:220,y2:300,record:10},
{x1:230,y1:264,x2:292,y2:300,record:3},
{x1:304,y1:264,x2:364,y2:300,record:5},
{x1:376,y1:264,x2:437,y2:300,record:1},
{x1:163,y1:323,x2:522,y2:333,record:1},
{x1:163,y1:343,x2:522,y2:350,record:1}
];

//矩形高亮游标
var rectCursor = -1;

var config = {
	paperSrc:"./small.jpg"
};

//获取鼠标在canvas上的坐标  
var getCanvasPos = function(canvas,evt)  
{
    var rect = canvas.getBoundingClientRect();   
    return {   
     x: evt.clientX - rect.left,
     y: evt.clientY - rect.top
   };  
}

//匹配某个坐标是否落在矩形模板中
var matchRect = function(mousePos){
    var loopTimes = 0;
    for(var index in rectArry){
        loopTimes = loopTimes + 1 ;
        if(rectArry[index].x1 < mousePos.x 
        && rectArry[index].y1 < mousePos.y 
        && rectArry[index].x2 > mousePos.x 
        && rectArry[index].y2 > mousePos.y){
            rectCursor = index;
            //console.log(rectArry[index]);
            return rectArry[index];
        }
    } 
    rectCursor = -1;
    return "";
}

//匹配批阅操作记录
var matchDrawOpInfo = function(){
    for(var index in drawOpArry){
        if(drawOpArry[index].rectIndex == rectCursor){
            return index;
        }
    }
    return "";
}

//判断是新增操作，还是修改操作
var markRightWrong = function(type){
	var opIndex = matchDrawOpInfo();	
	if(opIndex && opIndex != ""){
	//修改操作
		if(type == "RIGHT"){
			//已经为wrong
			if(!drawOpArry[opIndex].right){
				drawOpArry[opIndex].right = true;
				reDraw();
			}

		}else if(type == "WRONG"){
			//已经为right
			if(drawOpArry[opIndex].right){
				drawOpArry[opIndex].right = false;
				reDraw();
			}

		}

	}else{
		//新增
		var op = {};
	    op.rect = rectArry[rectCursor];
	    op.record = rectArry[rectCursor].record;
	    op.rectIndex = rectCursor;
	    var right = new Image();
	    right.onload = function(){
	        ctx.drawImage(right, rectArry[rectCursor].x2 - 30, rectArry[rectCursor].y2 -30, 30, 30);
	    }

	    if(type == "RIGHT"){
	    	right.src="right_new.png";
	    	op.right = true;
	    }else if(type == "WRONG"){
	    	right.src="wrong_new.png";
	    	op.right = false;
	    }

	    drawOpArry.push(op);
	}
}

//批阅 正确
var markRight = function(){
    console.log(rectArry[rectCursor]);
    var right = new Image();
    right.onload = function(){
        ctx.drawImage(right, rectArry[rectCursor].x2 - 30, rectArry[rectCursor].y2 -30, 30, 30);
    }
    right.src="right_new.png";
    var op = {};
    op.rect = rectArry[rectCursor];
    op.record = rectArry[rectCursor].record;
    op.right = true;
    op.rectIndex = rectCursor;
    drawOpArry.push(op);
}

//批阅 错误
var markWrong = function(){
    console.log(rectArry[rectCursor]);
    var right = new Image();
    right.onload = function(){
        ctx.drawImage(right, rectArry[rectCursor].x2 - 30, rectArry[rectCursor].y2 -30, 30, 30);
    }
    right.src="wrong_new.png";
    var op = {};
    op.rect = rectArry[rectCursor];
    op.record = 0;
    op.right = false;
    op.rectIndex = rectCursor;
    drawOpArry.push(op);
}

//画出矩形框
var markRect = function(){
	if(rectCursor == -1){
		return;
	}
	console.log("markRect.rectCursor:"+rectCursor);
    ctx.strokeStyle="#0BE500";
    ctx.lineWidth=1;
    ctx.strokeRect(rectArry[rectCursor].x1,
        rectArry[rectCursor].y1,
        rectArry[rectCursor].x2 - rectArry[rectCursor].x1,
        rectArry[rectCursor].y2 - rectArry[rectCursor].y1);

    $("#panel").show().css({
                "left": rectArry[rectCursor].x2,
                "top": rectArry[rectCursor].y1 + $('#mycanvas').offset().top - $("#panel").height()});
}

//用于重画、撤销
var drawRightWrong = function(op){
    var right = new Image();
    right.onload = function(){
        ctx.drawImage(right, op.rect.x2 - 30, op.rect.y2 -30, 30, 30);
    }
    if(op.right){
        right.src="right_new.png";
    }else{
        right.src="wrong_new.png";
    }    
}

//撤销操作
var revokeDraw = function(){
    var op = drawOpArry.pop();
    init();
    for(var index in drawOpArry){
        drawRightWrong(drawOpArry[index]);
    }
}
//重绘
var reDraw = function(){
	console.log("reDraw");
   init();
    for(var index in drawOpArry){
        drawRightWrong(drawOpArry[index]);
    }
}

//清除画布手动操作
var dropDraw = function(){
    drawOpArry.splice(0,drawOpArry.length);
    init();
}

//键盘next 事件
var nextRect = function(){
    if(rectCursor < rectArry.length -1){
         //rectCursor = rectCursor + 1;
        rectCursor ++;
        reDraw();
        markRect();
        var opIndex = matchDrawOpInfo();
        if(!opIndex){
        	markRightWrong("RIGHT");
        }       
    }
}

//键盘previous事件
var previousRect = function(){
    if(rectCursor > 0){
        //rectCursor = rectCursor -1;
        rectCursor --;
        reDraw();
        markRect();
    }  
}

var keybordOp = function(evt){
    console.log(evt.which);
    switch(evt.which){
        //press w
        case 87:
            //markWrong();
            previousRect();
        break;
        //press s
        case 83:
            nextRect();
        break;
        //press r
        case 82:
            markRightWrong("RIGHT");
        break;

        //press f
        case 70:
            markRightWrong("WRONG");
        break;
        //press u
        case 85:
            
        break;

        //press j
        case 74:
            
        break;
        //press k
        case 75:

        break;

    }
}

var canvasClick = function(evt){
	if(rectCursor != -1){       
	        var opIndex = matchDrawOpInfo();
	        console.log("click" + drawOpArry.length +";" + opIndex +";");
	        //未批阅
	        if(! opIndex){
	            markRightWrong("RIGHT");
	        }else{
	            if(drawOpArry[opIndex].right){
	                drawOpArry[opIndex].right = false;
	            }else{
	                drawOpArry[opIndex].right = true;
	            }
	            reDraw();
	        }   
       }
}

var canvasMouseMove = function(evt){
	var mousePos = getCanvasPos(canvas, evt);        
    var matRect = matchRect(mousePos);
    if(matRect){
        console.log("matched:"+mousePos.x + "," + mousePos.y +" ," + rectCursor);
        reDraw();
        markRect();
    }else{
           
        $("#panel").hide();  
    }
}

var init = function(){
	// polyfill 提供了这个方法用来获取设备的 pixel ratio  
    var getPixelRatio = function(context) {  
        var backingStore = context.backingStorePixelRatio ||  
            context.webkitBackingStorePixelRatio ||  
            context.mozBackingStorePixelRatio ||  
            context.msBackingStorePixelRatio ||  
            context.oBackingStorePixelRatio ||  
            context.backingStorePixelRatio || 1;  
      
        return (window.devicePixelRatio || 1) / backingStore;  
    };  
  
    var ratio = getPixelRatio(ctx);  
    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0, 0, 1000 * ratio, 800 * ratio);  
        if(rectCursor > -1){
            markRect();
        }
    }
    img.src = "small.jpg";


    //点击事件
    canvas.onclick = canvasClick;

    //鼠标移动事件
    canvas.onmousemove = canvasMouseMove;
    document.onkeydown = keybordOp;
}
$(function(){
    init();
});
//window.onload = init;
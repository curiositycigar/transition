/**
 * Created by 武刚 on 2016/4/7.
 */
/*
 *数据格式:
     {
         p1:{x:0.5,y:0.75},
         p2:{x:0.75,y:0.5},
         duration:1,
         delay:1,
         borderRadiusLT:0,borderRadiusRT:0,borderRadiusRB:0,borderRadiusLB:0,
         translateX:0,translateY:0,
         rotate:0,
         scaleX:1,scaleY:1,
         skewX:0,skewY:0
     }
 *库:lib当前库，lib是一个数组
 *属性：
 *  DOM对象
 *  当前画板属性(p1,p2坐标)
 *  当前区域属性
 *  展示中属性
 *方法：
 *  鼠标位置获取
 *  值转换（将鼠标位置转换为transition值，和将transition值转换为鼠标位置）
 *  监听控制点，并操作
 *
 *
 *
 *
*/
function byId(id){
    return document.getElementById(id);
}
/*
* 定义命名空间transitionMaker
*/
var transitionMaker={
    //
    canvasBezier:null,
    bezierTitle:null,
    //
    animating:false,//是否正在播放动画
    controller:{},
    target:{},
    using:{
        p1:{x:0.5,y:0.75},
        p2:{x:0.75,y:0.5},
        duration:1,
        delay:0,
        borderRadiusLT:0,borderRadiusRT:0,borderRadiusRB:0,borderRadiusLB:0,
        translateX:0,translateY:0,
        rotate:0,
        scaleX:1,scaleY:1,
        skewX:0,skewY:0
    },
    transitionAttr:"",
    borderRadiusAttr:"",
    transformAttr:"",
    mousePosition:{x:1,y:1}//鼠标位置
};
transitionMaker.propertyLib=[];
transitionMaker.lib=[];
/*
*监听鼠标移动
*/
transitionMaker.getMousePosition=function(elementParent,element){
    var mouse={x:0,y:0};
    elementParent.addEventListener("mousemove",function(event){
        var x,y;
        if(event.pageX||event.pageY){
            x=event.pageX;
            y=event.pageY;
        }else{
            x=event.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
            y=event.clientY+document.body.scrollTop+document.documentElement.scrollTop;
        }
        x-=element.offsetLeft;
        y-=element.offsetTop;
        mouse.x=x;
        mouse.y=y;
    },false);
    return mouse;
};
/*
 *值转换
 */
transitionMaker.mouseToPoint=function(mx,my){
    return {x:(mx-150)/200,y:(350-my)/200};
};
transitionMaker.pointToMouse=function(px,py){
    return {x:(px*200)+150,y:350-(py*200)};
};
/*
* 获取贝塞尔曲线控制点
*
*/
transitionMaker.getController=function(bodyElement,parentElement,element,name){
    var control=null;
    /*获取坐标*/
    var m=transitionMaker.getMousePosition(bodyElement,parentElement);
    /*保证控制点在canvas画布内*/
    function addMoveListener(){
        var x,y;
        if(m.x<50){
            element.style.left="50px";
            x=50;
        }else if(m.x>450){
            element.style.left="450px";
            x=450;
        }else{
            element.style.left=m.x+"px";
            x=m.x;
        }
        if(m.y<50){
            element.style.top="50px";
            y=50;
        }else if(m.y>450){
            element.style.top="450px";
            y=450;
        }else{
            element.style.top=m.y+"px";
            y=m.y;
        }
        transitionMaker.mousePosition.x= x;
        transitionMaker.mousePosition.y= y;
        transitionMaker.using[name]=transitionMaker.mouseToPoint(x,y);
        transitionMaker.changeData();
        transitionMaker.drawBezier(byId("cubicBezier"),"#aaaaaa","#000000");
        transitionMaker.drawBezier(byId("transformBlock"),"#ffffff","#ffffff");
        transitionMaker.transitionAttr=transitionMaker.getTransitionAttr();
        transitionMaker.basicAttrShow(byId("basicAttrShow"));
    }
    /*
     * 添加监听事件
     * 监听鼠标对控制点的操作
    */
    element.addEventListener("mousedown",function(){
        control=document.addEventListener("mousemove",addMoveListener);
    });
    document.addEventListener("mouseup",function(){
        document.removeEventListener("mousemove",addMoveListener);
    });
};
/*
 * 改变头部transition的值
 */
transitionMaker.changeData=function (){
    transitionMaker.bezierTitle.innerHTML=transitionMaker.using.p1.x.toFixed(2)+","+transitionMaker.using.p1.y.toFixed(2)+","+transitionMaker.using.p2.x.toFixed(2)+","+transitionMaker.using.p2.y.toFixed(2);
};

/*
* 绘制贝塞尔曲线
*/
transitionMaker.drawBezier=function(canvas,colorLine,colorBezier){
    var context2d=canvas.getContext('2d');
    var p1={x:(transitionMaker.using.p1.x+0.5)*(canvas.width/2),y:canvas.height-(transitionMaker.using.p1.y+0.5)*(canvas.height/2)};
    var p2={x:(transitionMaker.using.p2.x+0.5)*(canvas.width/2),y:canvas.height-(transitionMaker.using.p2.y+0.5)*(canvas.height/2)};
    context2d.clearRect(0,0,canvas.width,canvas.height);
    context2d.strokeStyle=colorLine;
    context2d.lineWidth=2;
    context2d.beginPath();
    context2d.moveTo(canvas.width/4,canvas.height-canvas.height/4);
    context2d.lineTo(p1.x,p1.y);
    context2d.moveTo(canvas.width-canvas.width/4,canvas.height/4);
    context2d.lineTo(p2.x,p2.y);
    context2d.stroke();
    context2d.lineWidth=5;
    context2d.strokeStyle=colorBezier;
    context2d.lineCap="round";
    context2d.beginPath();
    context2d.moveTo(canvas.width/4,canvas.height-canvas.height/4);
    context2d.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,canvas.width-canvas.width/4,canvas.height/4);
    context2d.stroke();
};
/*
* 监听range变化
*/
transitionMaker.listenRange=function(parentElement){
    var trigger=false;
    parentElement.addEventListener("mousedown",function(e){
        if(e.target.tagName=="input" || e.target.tagName=="INPUT"){
            trigger=true;
        }
    });
    parentElement.addEventListener("mouseup",function(){
        trigger=false;
    });
    parentElement.addEventListener("mousemove",function(e){
        if(e.target.tagName=="input" || e.target.tagName=="INPUT"){
            if(trigger==true){
                e.target.parentNode.getElementsByClassName("output")[0].innerHTML= e.target.value;
                transitionMaker.using[e.target.id]= e.target.value;
                transitionMaker.getTransformBlockCss(byId("transformBlock"));
                transitionMaker.basicAttrShow(byId("basicAttrShow"));
            }
        }
    });
    /*监听鼠标操作range*/
    parentElement.addEventListener("change",function(e){
        if(e.target.tagName=="input" || e.target.tagName=="INPUT"){
            e.target.parentNode.getElementsByClassName("output")[0].innerHTML= e.target.value;
            transitionMaker.using[e.target.id]= e.target.value;
            transitionMaker.getTransformBlockCss(byId("transformBlock"));
            transitionMaker.basicAttrShow(byId("basicAttrShow"));
        }
    });
};
/*
 *得到改变后的css值
 *改变目标的css值
 * 展示基本css属性
*/
transitionMaker.getTransformBlockCss=function(element){
    transitionMaker.borderRadiusAttr="border-radius:"+transitionMaker.using.borderRadiusLT+"px "+transitionMaker.using.borderRadiusRT+"px "+transitionMaker.using.borderRadiusRB+"px "+transitionMaker.using.borderRadiusLB+"px;";
    transitionMaker.transformAttr="transform:"
        +((transitionMaker.using.translateX==0)&&(transitionMaker.using.translateY==0)?"":(" translate("+transitionMaker.using.translateX+"px,"+transitionMaker.using.translateY+"px)"))
        +(transitionMaker.using.rotate==0?"":" rotate("+transitionMaker.using.rotate+"deg)")
        +((transitionMaker.using.scaleX==0)&&(transitionMaker.using.scaleY==0)?"":(" scale("+transitionMaker.using.scaleX+","+transitionMaker.using.scaleY+")"))
        +((transitionMaker.using.skewX==0)&&(transitionMaker.using.skewY==0)?"":(" skew("+transitionMaker.using.skewX+"deg,"+transitionMaker.using.skewY+"deg)"))+";";
    transitionMaker.transitionAttr=transitionMaker.getTransitionAttr();
    element.setAttribute("style",transitionMaker.transformAttr+transitionMaker.borderRadiusAttr);
};
transitionMaker.getTransitionAttr=function(){
    return "transition: all "+transitionMaker.using.duration+"s cubic-bezier("+transitionMaker.using.p1.x.toFixed(2)+","+transitionMaker.using.p1.y.toFixed(2)+","+transitionMaker.using.p2.x.toFixed(2)+","+transitionMaker.using.p2.y.toFixed(2)+") "+transitionMaker.using.delay+"s;";
};
transitionMaker.basicAttrShow=function(element){
    element.innerHTML=transitionMaker.transformAttr+"<br>"+transitionMaker.borderRadiusAttr+"<br>"+transitionMaker.transitionAttr;
};
/*
* 播放动画
*/
transitionMaker.playAnimation=function(clickElement,animationElement){
    clickElement.onclick=function(){
       // console.log(transitionMaker.animating);
        if(transitionMaker.animating==false) {
            animationElement.setAttribute("style","");
            clickElement.innerHTML="复位";
            transitionMaker.animating = true;
            animationElement.setAttribute("style", transitionMaker.transformAttr + "" + transitionMaker.borderRadiusAttr + "" + transitionMaker.transitionAttr);
        }else{
            transitionMaker.animating = false;
            clickElement.innerHTML="查看动画演示";
            animationElement.setAttribute("style","");
        }
    }

};
/*
 *初始化
 *   初始变量
 *   画布
*/
transitionMaker.init=function(){
};
window.onload=function(){
    transitionMaker.listenRange(byId("operationArea"));
    transitionMaker.property=byId("property");
    transitionMaker.duration=byId("duration");
    transitionMaker.bezierTitle=byId("bezierTitle");
    transitionMaker.delay=byId("delay");
    transitionMaker.getController(document.body,byId("canvasContainer1"),byId("p1"),"p1");
    transitionMaker.getController(document.body,byId("canvasContainer1"),byId("p2"),"p2");
    transitionMaker.drawBezier(byId("cubicBezier"),"#aaaaaa","#000000");
    transitionMaker.playAnimation(byId("play"),byId("basicTransformBlock"));
};
/**
 * Created by 武刚 on 2016/4/7.
 */
/*
 *数据格式:
 *{name:"ease-in",property:"all",duration:0.5,bezier:{x1:0.5,y1:0.5,x2:0.5,y2:0.5},delay:0.5}
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
    context2dBezier:null,
    bezierTitle:null,
    //
    property:null,//transition目标属性
    duration:null,//transition时间
    bezier:null,//贝塞尔曲线
    delay:null,//transition延时
    using:{property:"all",duration:0.5,p1:{x:0.5,y:0.75},p2:{x:0.75,y:0.5},delay:0.5},
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
        var x,y,x0,y0;
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
* 获取控制点
*   传参（控制点，控制点名）
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
    var str=transitionMaker.using.p1.x.toFixed(2)+","+transitionMaker.using.p1.y.toFixed(2)+","+transitionMaker.using.p2.x.toFixed(2)+","+transitionMaker.using.p2.y.toFixed(2);
    transitionMaker.bezierTitle.innerHTML=str;
};

/*
* 绘制贝塞尔曲线  操作区以及动画展示区
*/
transitionMaker.drawBezierBg=function(){

};
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
 *初始化
 *   初始变量
 *   画布
*/
transitionMaker.init=function(property,duration,bezier,delay,canvas){
    transitionMaker.property=byId("property");
};
window.onload=function(){
    /*导航切换逻辑*/
    (function() {
        var blocks=document.getElementsByClassName("operation-block");
        var navs=byId("navContral").getElementsByTagName("li");
        byId("navContral").addEventListener("click", function (e) {
            if (e.target.getAttribute("data-target") != null) {
                for(var i=0;i<blocks.length;i++){
                    blocks[i].style.display="none";
                    if(navs[i].className.match(new RegExp('(\\s|^)active(\\s|$)'))){
                        navs[i].className="";
                    }
                }
                e.target.className="active";
                blocks[e.target.getAttribute("data-target")].style.display="block";
            }
        });
    })();
    transitionMaker.property=byId("property");
    transitionMaker.duration=byId("duration");
    transitionMaker.bezierTitle=byId("bezierTitle");
    transitionMaker.delay=byId("delay");
    //transitionMaker.mousePosition=transitionMaker.getMousePosition(document.body,byId("canvasContainer1"));
    transitionMaker.getController(document.body,byId("canvasContainer1"),byId("p1"),"p1");
    transitionMaker.getController(document.body,byId("canvasContainer1"),byId("p2"),"p2");
    transitionMaker.drawBezier(byId("cubicBezier"),"#aaaaaa","#000000");
};
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
    canvas:null,
    context2d:null,
    property:null,//transition目标属性
    duration:null,//transition时间
    bezier:null,//贝塞尔曲线
    delay:null,//transition延时
    p1:{x:0.25,y:0.1},//p1控制点 坐标
    p2:{x:0.25,y:1},//p2控制点 坐标
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
    return {x:((mx-150)/200).toFixed(2),y:((350-my)/200).toFixed(2)};
};
transitionMaker.pointToMouse=function(px,py){
    return {x:(px*200)+150,y:350-(py*200)};
};
/*
* 获取控制点
*   传参（控制点，控制点名）
*/
transitionMaker.getController=function(element,name){
    var control=null;
    /*获取坐标*/
    /*保证控制点在canvas画布内*/
    function addMoveListener(){
        var x,y;
        if(transitionMaker.mousePosition.x<50){
            element.style.left="50px";
            x=50;
        }else if(transitionMaker.mousePosition.x>450){
            element.style.left="450px";
            x=450;
        }else{
            element.style.left=transitionMaker.mousePosition.x+"px";
            x=transitionMaker.mousePosition.x;
        }
        if(transitionMaker.mousePosition.y<50){
            element.style.top="50px";
            y=50;
        }else if(transitionMaker.mousePosition.y>450){
            element.style.top="450px";
            y=450;
        }else{
            element.style.top=transitionMaker.mousePosition.y+"px";
            y=transitionMaker.mousePosition.y;
        }
        transitionMaker[name]=transitionMaker.mouseToPoint(x,y);
        transitionMaker.changeData();
        console.log(name+":"+transitionMaker[name].x+","+transitionMaker[name].y);
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
    transitionMaker.bezier.innerHTML=transitionMaker.p1.x+","+transitionMaker.p1.y+","+transitionMaker.p2.x+","+transitionMaker.p2.y;
}
/*改变坐标值*/
transitionMaker.changeXY=function(){

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
    transitionMaker.property=byId("property");
    transitionMaker.duration=byId("duration");
    transitionMaker.bezier=byId("bezier");
    transitionMaker.delay=byId("delay");
    transitionMaker.mousePosition=transitionMaker.getMousePosition(document.body,byId("canvasContainer1"));
    transitionMaker.getController(byId("p1"),"p1");
    transitionMaker.getController(byId("p2"),"p2");
    transitionMaker.getController(byId("c1"),"c1");
};
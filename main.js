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
     //17位参数
     #0.50,0.75,0.75,0.50,1,1,  0,0,0,0,  0,0,  0,  1,1,0,0
 *库:lib当前库，lib是一个数组
 *属性：
 *  DOM对象
 *  当前画板属性(p1,p2坐标)
 *  当前区域属性
 *  展示中属性
 *方法：
 *  鼠标位置获取
 *  值转换（将鼠标位置转换为transition值，和将transition值转换为鼠标位置）
 *  监听控制点,滑块，并操作
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
    parameterArray:null,
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
    return {x:(mx-100)/200,y:(350-my)/200};
};
transitionMaker.pointToMouse=function(px,py){
    return {x:(px*200)+100,y:350-(py*200)};
};
/*
* 获取贝塞尔曲线控制点
*
*/
transitionMaker.getController=function(bodyElement,parentElement,element,name){
    var control=null;
    /*获取坐标*/
    var m=transitionMaker.getMousePosition(bodyElement,parentElement);
    /*保证控制点在canvas画布的正确范围内*/
    function addMoveListener(){
        var x,y;
        if(m.x<100){
            element.style.left="100px";
            x=100;
        }else if(m.x>300){
            element.style.left="300px";
            x=300;
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
        //console.log(transitionMaker.using[name]);
        transitionMaker.changeData();
        /*实时绘制贝塞尔曲线*/
        transitionMaker.drawBezier(byId("cubicBezier"),"#aaaaaa","#000000");
        transitionMaker.drawBezier(byId("basicTransformBlock"),"#ffffff","#ffffff");
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
//    var p1=transitionMaker.pointToCnavas(transitionMaker.using.p1.x,transitionMaker.using.p1.y);
//    var p2=transitionMaker.pointToCnavas(transitionMaker.using.p2.x,transitionMaker.using.p2.y);
    var p1={x:(transitionMaker.using.p1.x*canvas.width*2/3)+canvas.width/6,y:canvas.height-transitionMaker.using.p1.y*canvas.height/2-canvas.height/4};
    var p2={x:(transitionMaker.using.p2.x*canvas.width*2/3)+canvas.width/6,y:canvas.height-transitionMaker.using.p2.y*canvas.height/2-canvas.height/4};
    context2d.clearRect(0,0,canvas.width,canvas.height);
    context2d.strokeStyle=colorLine;
    context2d.lineWidth=2;
    context2d.beginPath();
    context2d.moveTo(canvas.width/6,canvas.height-canvas.height/4);
    context2d.lineTo(p1.x,p1.y);
    context2d.moveTo(canvas.width-canvas.width/6,canvas.height/4);
    context2d.lineTo(p2.x,p2.y);
    context2d.stroke();
    context2d.lineWidth=5;
    context2d.strokeStyle=colorBezier;
    context2d.lineCap="round";
    context2d.beginPath();
    context2d.moveTo(canvas.width/6,canvas.height-canvas.height/4);
    context2d.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,canvas.width-canvas.width/6,canvas.height/4);
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
    /*监听键盘操作range*/
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
* 检查参数的正确性
*/
transitionMaker.checkParameter=function(parameterArray){
    function check0(number){
        return number>=0&&number<=10;
    }
    function check1(number){
        return number>=0&&number<=1;
    }
    function check2(number){
        return number>=-0.5&&number<=1.5;
    }
    function check3(number){
        return number>=0&&number<=75;
    }
    function check4(number){
        return number>=-150&&number<=150;
    }
    function check5(number){
        return number>=-4&&number<=4;
    }
    function check6(number){
        return number>=-360&&number<=360;
    }
    return check1(parameterArray[0])&&check2(parameterArray[1])&&check1(parameterArray[2])&&check2(parameterArray[3])&&check0(parameterArray[4])&&check0(parameterArray[5])&&check3(parameterArray[6])&&check3(parameterArray[7])&&check3(parameterArray[8])&&check3(parameterArray[9])&&check4(parameterArray[10])&&check4(parameterArray[11])&&check6(parameterArray[12])&&check5(parameterArray[13])&&check5(parameterArray[14])&&check6(parameterArray[15])&&check6(parameterArray[16]);
};
/*
* 填入参数
*/
transitionMaker.getParameter=function(){
    var str=location.href.split("#")[1];
    //检查是否有参数
    if(str) {
        var parameterArray = str.split(",").map(function (value) {
            return parseFloat(value)
        });
        //检查参数是否正确
        if(transitionMaker.checkParameter(parameterArray)){
            transitionMaker.parameterArray=parameterArray;
            //填参数
            transitionMaker.cloneArrayToObject(parameterArray,transitionMaker.using);
        }else{
            console.log("参数错误");
        }
    }
};
/*clone参数数组到using对象*/
transitionMaker.cloneArrayToObject=function(array,object){
    var i=0;
    clone(object);
    function clone(object){
        for(var item in object){
            if(typeof(object[item])!="object"){
                object[item]=array[i++];
            }else{
                clone(object[item]);
            }
        }
    }
};
/*将using数组转化为参数*/
transitionMaker.cloneObjectToParameter=function(object){
    parameter="";
    clone(object);
    function clone(object){
        for(var item in object){
            if(typeof(object[item])!="object"){
                parameter+=(object[item]+",");
            }else{
                clone(object[item]);
            }
        }
    }
    return parameter;
};
/*
* 播放动画
*/
transitionMaker.playAnimation=function(clickElement,animationElement){
    clickElement.onclick=function(){
       // console.log(transitionMaker.animating);
        if(transitionMaker.animating==false) {
            animationElement.setAttribute("style","");
            clickElement.innerHTML="回到起点";
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
* 根据参数初始化页面
*/
transitionMaker.initPage=function(){
    var p1=transitionMaker.pointToMouse(transitionMaker.using.p1.x,transitionMaker.using.p1.y);
    var p2=transitionMaker.pointToMouse(transitionMaker.using.p2.x,transitionMaker.using.p2.y);
    var ranges=document.getElementsByTagName("input");
    byId("p1").style.left=p1.x+"px";
    byId("p1").style.top=p1.y+"px";
    byId("p2").style.left=p2.x+"px";
    byId("p2").style.top=p2.y+"px";
    console.log("point done");
    transitionMaker.drawBezier(byId("cubicBezier"),"#aaaaaa","#000000");
    console.log("bezier down");
    var i=0;
    for(var item in transitionMaker.using){
        if(typeof(transitionMaker.using[item])!="object") {
            ranges[i].setAttribute("value", transitionMaker.using[item]);
            ranges[i].parentNode.getElementsByClassName("output")[0].innerHTML = transitionMaker.using[item];
            ++i;
        }
    }
    transitionMaker.getTransformBlockCss(byId("transformBlock"));
};
/*
* 加入library
*/
transitionMaker.addToLibrary=function(clickElement,libraryElement){
    clickElement.onclick=function () {
        var div=document.createElement("div");
        var canvas=document.createElement("canvas");
        canvas.width=100;
        canvas.height=100;
        transitionMaker.drawBezier(canvas,"#ffffff","#ffffff");
        var a=document.createElement("a");
        a.target="_blank";
        a.innerHTML="在新窗口查看";
        a.href="#"+transitionMaker.cloneObjectToParameter(transitionMaker.using);
        div.appendChild(canvas);
        div.appendChild(a);
        libraryElement.appendChild(div);
    }
};
/*
 *初始化
*/
transitionMaker.init=function(){
    transitionMaker.bezierTitle=byId("bezierTitle");
    transitionMaker.getParameter();
    transitionMaker.initPage();
    transitionMaker.listenRange(byId("operationArea"));
    transitionMaker.getController(document.body,byId("canvasContainer1"),byId("p1"),"p1");
    transitionMaker.getController(document.body,byId("canvasContainer1"),byId("p2"),"p2");
    transitionMaker.playAnimation(byId("play"),byId("basicTransformBlock"));
    transitionMaker.addToLibrary(byId("addToLibrary"),byId("library"));
};
window.onload=function(){
    transitionMaker.init();
};

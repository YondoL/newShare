var api = "http://api.upshequ.com/"
window.onload=function(){

$("#share-page").on("click",function(){
    window.location.href = "http://www.upshequ.com/download/download.html"
})



    var href = window.location.href;
    if(href.indexOf("&") == -1){
        var topicId = href.substr(href.indexOf("=")+1);
    }else{
        var topicId = href.substring(href.indexOf("=")+1,href.indexOf("&"));
    }
    // console.log(topicId)

    // 测试调用
    var sendData = {topicId:topicId};
    Ajax('get',api+"api/topic/getById" , sendData, function(data){
        var v=JSON.parse(data),
            comments = v.comments;
            console.log(v)
        time = getDateDiff( (v.createdAt).substr(0,(v.createdAt).lastIndexOf(' ')) );

        var userName = $(".user-name"),
            timeText = $(".timeText"),
            userImg = $(".user-img"),
            contentWord = $(".content-word"),
            replyNum = $(".replyNum"),
            typeChange = $(".reply-header-right"),
            typeMenu = $(".type-menu");
        


        // 添加小数据
        userImg.attr("src",v.img);
        userName.html(v.nickName);
        timeText.html(time);
        replyNum.html(v.commentNum)
        if(v.content == ""){
            contentWord.css({"margin":"0 0","height":"12px"})
        }
        contentWord.html(v.content);

        var mixNum = v.upNum - v.downNum;
        $(".mixNum").html(mixNum);
        $(".commentNum").html(v.commentNum)
        

        // 判断内容形势
        if(v.conType == 2){
            $(".content-img").remove();
            var imgsLink = v.imgsUrl;
            var textLink = v.title;
            showImg( v.imgsUrl );
            var linkData = {
                imgsLink:imgsLink,
                textLink:textLink
            }
            var linkHtml =  baidu.template("linkDivs",linkData);
            $(".content-link").html(linkHtml);
            goodImg($(".linkDiv img"),100,3);
        }else{
            // 显示的图片
            if(v.imgsUrl && v.imgsUrl!=""){
                var imgArr = JSON.parse(v.imgsUrl);
                var imgNum = imgArr.length;
                var imgs = {
                    imgArr:imgArr,
                    imgNum:imgNum
                } 
                var imageHtml =  baidu.template("imgDivs",imgs,imgNum);
                $(".content-img").html(imageHtml);
                goodImg($(".content-img img"),100,imgArr.length);
            }          
        }
        // upDown
        myUpDown(v.myUpDown,$(".like-num img"),$(".unlike-num img"));

        // 评论的显示
        var commentsArray = v.comments;
        var timeObject = new Object();
        var timeArr = [];
        var weekArr = [];
        $.each(commentsArray,function(index,value){
            time = getDateDiff( (value.createdAt).substr(0,(value.createdAt).lastIndexOf(' '))  );
            week = getWeekDiff( (value.createdAt).substr(0,(value.createdAt).lastIndexOf(' ')) );
            timeArr.push(time);
            weekArr.push(week);
        });
        timeObject.a = timeArr;
        timeObject.b = weekArr;
        var Array = {
            Array:commentsArray,
            time:timeObject.a,
            week:timeObject.b
        }
        var html = baidu.template("reply-other",Array,time);
        $(".reply-content").html(html);
        $("#share-page").css("visibility","visible");

        // 评论回复的层级逻辑
        var listS = $(".other-reply-first");
        var comList = $(".other-reply-first");
        $.each(listS,function(index,value){
            var level = $(value).attr("level");
            var floor = level.length/2-1;
            var likeType = JSON.parse($(value).attr("likeType"));
            myUpDown(likeType,$(".icon-like"),$(".icon-unlike"));
            if(floor != 0){
                if(level.charAt(level.length-1) == 0 ){
                    for(var i=index;i>=0;i--){
                        if(comList.eq(i).attr("level").length == level.length-2){
                            $(this).appendTo(comList.eq(i));
                            $(this).addClass("floor")
                            break;                           
                        }
                    }                    
                }else{
                    for(var j=index-1;j>=0;j--){
                        if(comList.eq(j).attr("level").length == level.length){
                            $(this).insertAfter(comList.eq(j));
                            $(this).addClass("floor")
                            break; 
                        }
                    }
                }
                
            }
        })        
    }, function(error){
        console.log(error);
    });
}

function myUpDown(index,domlike,domunlike){
    switch(index){
        case 0:domlike.attr("src","../images/up.png");domunlike.attr("src","../images/down2.png");
            break;
        case 1:domlike.attr("src","../images/up2.png");domunlike.attr("src","../images/down.png");
            break;
        case 2:domlike.attr("src","../images/up2.png");domunlike.attr("src","../images/down2.png");
            break;
    }
}
function Ajax(type, url, data, success, failed){
    // 创建ajax对象r
    var xhr = null;
    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }
 
    var type = type.toUpperCase();
    // 用于清除缓存
    var random = Math.random();
 
    if(typeof data == 'object'){
        var str = '';
        for(var key in data){
            str += key+'='+data[key]+'&';
        }
        data = str.replace(/&$/, '');
    }
 
    if(type == 'GET'){
        if(data){
            xhr.open('GET', url + '?' + data, true);
        } else {
            xhr.open('GET', url + '?t=' + random, true);
        }
        xhr.send();
 
    } else if(type == 'POST'){
        xhr.open('POST', url, true);
        // 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头。
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(data);
    }
 
    // 处理返回数据
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                success(xhr.responseText);
            } else {
                if(failed){
                    failed(xhr.status);
                }
            }
        }
    }
}

// 时间函数
function getDateTimeStamp (dateStr) {
    return Date.parse(dateStr.replace(/-/gi,"/"));
}
function getDateDiff (dateStr) {
    var publishTime = getDateTimeStamp(dateStr)/1000,
        d_seconds,
        d_minutes,
        d_hours,
        d_days,
        timeNow = parseInt(new Date().getTime()/1000),
        d,

        date = new Date(publishTime*1000),
        Y = date.getFullYear(),
        M = date.getMonth() + 1,
        D = date.getDate(),
        H = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
        //小于10的在前面补0
        if (M < 10) {
            M = M;
        }
        if (D < 10) {
            D = '0' + D;
        }
        if (H < 10) {
            H = '0' + H;
        }
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }

    d = timeNow - publishTime;
    d_days = parseInt(d/86400);
    d_hours = parseInt(d/3600);
    d_minutes = parseInt(d/60);
    d_seconds = parseInt(d);

    if(d_days > 0 && d_days < 8){
        return d_days + '天前';
    }else if(d_days <= 0 && d_hours > 0){
        return d_hours + '小时前';
    }else if(d_hours <= 0 && d_minutes > 0){
        return d_minutes + '分钟前';
    }else if (d_seconds < 60) {
       
        return '刚刚发表';
        
    }else if (d_days >= 8 && d_days < 30){
        return M + '月' + D + '日';
    }
    else if (d_days >= 30) {
        return Y + '年' + M + '月' + D + '日';
    }
    
}
function getWeekDiff(str){
    var d = new Date(Date.parse(str.replace(/-/g, "/"))); 
    var day = d.getDay();
    switch(day){
        case 0:return "周日"; break;
        case 1:return "周一"; break;
        case 2:return "周二"; break;
        case 3:return "周三"; break;
        case 4:return "周四"; break;
        case 5:return "周五"; break;
        case 6:return "周六"; break;
    }
}

// 图片的截取
function goodImg(doms,size,num) {
    var image = doms;
    if(num == 1){
        $("#changeDiv").css("width","100%");
        var timer = setInterval(function(){
            var w = image[0].width,
                h = image[0].height;
            if(h != 0){
                clearInterval(timer);
                if(h >= w){
                    $(".imgContent").css({"height":"100%","width":"auto","top":"0","visibility":"visible","borderRadius":"5px"});
                    return;
                }else{
                    $("#changeDiv").removeClass("imgDiv").addClass("imgDiv2").css("height",h+"px");

                    $(".imgContent").css({"width":"100%","top":"0","visibility":"visible","borderRadius":"5px"});
                    return;
                }
            }

        },10)
        return;
    }
    image.each(function (index){
        image[index].onload = function(){
            var w = image[index].width,
                h = image[index].height;
            if(w==size && h==size){
                // $(".imgDiv img").css("top","-20px")
                return;
            }
            if(w>h){
                var cilp_w = parseInt((size/h*w-size)/2);
                var heights = size + "%";
                var lefts = -(cilp_w)+"%";
                $(this).removeClass("imgContent").addClass("imgContent2");
                $(this).css({"left":lefts,"height":heights,"visibility":"visible"})
            }else{
                var cilp_h = parseInt((size/w*h-size)/2);
                var tops = -(cilp_h)+"%";
                var widths = size+'%';
                $(this).css({"top":tops,"width":widths,"visibility":"visible"});
            }
        };
    })       
}

// 破解防盗链
function showImg( url ) {
    var frameid = 'frameimg' + Math.random();
    window.img = '<img id="img" src=\''+url+'?'+Math.random()+'\' />';
    return '<iframe id="' + frameid + '" src="javascript:parent.img;" frameBorder="0" scrolling="no" width="100%"></iframe>';
}
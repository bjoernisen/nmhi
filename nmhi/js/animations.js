$(".widget").fadeToggle(0);
$(".widget").fadeToggle(2000);

function updateWidgets(){
    $(".lower-widget").children().fadeToggle(0);
    let boxHeight = $(".widget").height();
    $(".widget").mouseenter(function(){
            $(this)
            .stop(true, true)
            .animate({
                height: "122",
                margin: "0 16 0 16"
            }, 120)
            .find(".lower-widget")
            .children()
            .stop(true)
            .fadeToggle(200, console.log("a"));
        })
        .mouseleave(function(){
            $(this)
            .stop(true, false)
            .animate({
                height: boxHeight,
                margin: "16 16 16 16"
            }, 180)
            .find(".lower-widget")
            .children()
            .stop(true)
            .fadeToggle(160, console.log("b"));
        });
        
        // $(".widget").click(function(){
        //     $(this).find(".temp").fadeToggle(200);
        // });
    };
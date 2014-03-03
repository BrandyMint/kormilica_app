$.fn.bounce = function(times, distance, speed) {
    for(i = 0; i < times; i++) {
        $(this).animate({marginTop: '-='+distance},speed)
            .animate({marginTop: '+='+distance},speed);
    }        
}

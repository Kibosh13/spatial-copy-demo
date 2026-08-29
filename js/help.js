$('.menu-btn').on('click', function(e) {
  e.preventDefault();
  $('.menu').toggleClass('menu_active');
  $('.content').toggleClass('content_active');
  $('body').toggleClass('body_hide');
  $('.logo2').toggleClass('disno');
  $('#blackdiv').toggleClass('bdshow');
  $('#mnubar').toggleClass('mnubars');
  
  });


$(document).ready(function() {
    $("a.anchor").click(function () {
        var elementClick = $(this).attr("href")
        var destination = $(elementClick).offset().top;
        jQuery("html:not(:animated),body:not(:animated)").animate({scrollTop: destination}, 800);
        return false;
    });
	});

$(document).click( function(event){
		 event.stopPropagation();
      if( $(event.target).closest("section").length  || $(event.target).closest("article").length) 
        return;
      $("section").fadeOut("fast");
	  $('body').css('overflow', 'auto');
      event.stopPropagation();
});


   
function pload(a){

	$('#piload' + a + '').show();
	$('#pload' + a + '').hide();
	
}	

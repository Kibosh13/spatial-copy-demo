function cart(a = 0){
		lang = $('#_lang').val();
		if(a == 0) $('#cartres').html('<div style="text-align:center;padding: 30px;"><img src="/spatial-copy/i/loader_black.svg" style="wdith: 32px;"/spatial-copy/></div>');
     
var req = new JsHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
				
						if(req.responseJS.res != '') $('#cartres').html(req.responseJS.res); else{
							if(a == 2){document.location.reload();}
						}
						
					 }
            }
      
        req.caching = false;
        req.open('POST', '/spatial-copy/js/cart.php', true);
        req.send({a:a, lang:lang});
}
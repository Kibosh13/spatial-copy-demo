function tocart(a, b, c=0, d=0, e=0, f=-1){
		
			kolvo = $('#kolvo').val();
			id_kuchnost = $('#id_kuchnost').val();
			id_good = a;
			id_razmer = b;
			id_sborka = $('#id_sborka').val();	
			id_temp = c;
			id_material = e;
			id_glass = $('#id_glass').val();
			action_price = $('#action_price').val();
			is_stock = 0;
			glass_type = $('#glass_type').val();
			if(document.getElementById('is_stock')){is_stock = 1;}
var req = new JsHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
				
						if(req.responseJS.res == 1){
							name = 'cart[' + id_good + '_' + id_razmer + '_' + id_temp + '_' + d + '_' + id_material + '_' + id_glass + '_' + action_price + '_' + id_kuchnost + '_' + id_sborka + '_' + is_stock + '_' + glass_type + ']';
							var date = new Date(new Date().getTime() + 60 * 1000 * 60 * 24 * 14);
							document.cookie = name + "=" + kolvo + "; path=/; expires=" + date.toUTCString();
						}
						
				$('#showcart').click();
			}
        }
      
        req.caching = false;
        req.open('POST', '/spatial-copy/js/tocart.php', true);
        req.send({});						
               
}
 
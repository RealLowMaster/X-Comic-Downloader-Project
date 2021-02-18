var ok = 'Ok';
var dir = 'ltr';
function error(err) {
    let html = '<div class="action-error"><div><p style="direction:'+dir+'">'+err+'</p><button type="button" onclick="$(this).parents(\'.action-error\').remove()" style="direction:'+dir+'">'+ok+'</button></div></div>';
	$('body').append(html);
}

function errorList(list) {
    console.log(list);
}
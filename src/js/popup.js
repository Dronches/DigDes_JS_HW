//Функция отображения PopUp
function CommentShow(){
	document.getElementById('popup-comment').hidden = false;
	document.body.style.overflow = "hidden";

}
//Функция скрытия PopUp
function CommentHide(){
	document.getElementById('popup-comment').hidden = true;
	document.body.style.overflow = "scroll";
}

var title = "HN";

document.title = document.title.replace(/Hacker News/, title);

document.querySelector(".pagetop .hnname > a").textContent = title;


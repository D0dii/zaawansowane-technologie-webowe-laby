const body = document.querySelector("body");
const changeThemeButton = document.querySelector("#btn-theme");

changeThemeButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  body.classList.toggle("light-theme");
  if (body.classList.contains("dark-theme")) {
    changeThemeButton.textContent = "Light Theme";
  } else {
    changeThemeButton.textContent = "Dark Theme";
  }
});

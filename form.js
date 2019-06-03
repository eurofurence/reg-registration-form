document.addEventListener("click", evt => {
  const target = evt.target;
  if (target.classList.contains("help-toggle-button")) {
    target.parentNode.classList.toggle("expanded");
  }
});

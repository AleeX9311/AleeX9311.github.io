(function () {
  var form = document.querySelector("form[data-thanks]");
  if (!form) return;
  var box = document.querySelector("[data-thanks-box]");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    if (!name) {
      var nameInput = form.querySelector("[name=name]");
      if (nameInput) nameInput.focus();
      return;
    }
    var slot = box.querySelector("[data-name]");
    if (slot) slot.textContent = name;
    form.hidden = true;
    box.hidden = false;
    box.focus();
  });
})();

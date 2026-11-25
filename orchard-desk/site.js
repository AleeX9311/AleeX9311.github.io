(function () {
  var note = document.getElementById("plan-note");
  if (!note) return;
  document.querySelectorAll("[data-plan]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var plan = link.getAttribute("data-plan");
      if (plan === "start") {
        note.textContent = "This is a sample start. No account was created and nothing was billed.";
      } else {
        note.textContent = "You chose the sample " + plan + " plan. No account was created and nothing was billed.";
      }
      note.focus();
    });
  });
})();

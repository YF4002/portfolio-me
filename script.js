const previewButton = document.querySelector("#preview-button");
const profileInput = document.querySelector("#profile-input");
const inputHint = document.querySelector("#input-hint");

previewButton.addEventListener("click", () => {
  const value = profileInput.value.trim();
  if (!value) {
    inputHint.textContent = "Add a link to see your first draft.";
    inputHint.classList.add("error");
    profileInput.focus();
    return;
  }

  inputHint.textContent = "Nice. Your first draft is ready to shape.";
  inputHint.classList.remove("error");
  previewButton.textContent = "Added ✓";
});

profileInput.addEventListener("input", () => {
  inputHint.textContent = "No account needed to explore.";
  inputHint.classList.remove("error");
  previewButton.textContent = "Preview";
});

export function formSubmitDisableState(): void {
  const forms = document.querySelectorAll<HTMLFormElement>('[data-form-disable-submit]');

  if (!forms.length) return;

  function checkValidity(inputs: NodeListOf<HTMLInputElement>, submit: HTMLInputElement) {
    const allFilled = Array.from(inputs).every((input) => input.value.trim() !== '');
    submit.disabled = !allFilled;
  }

  forms.forEach((form) => {
    const submit = form.querySelector<HTMLInputElement>('[type="submit"]');
    const inputs = form.querySelectorAll<HTMLInputElement>('input[required]');
    if (!submit) return;

    inputs.forEach((input) =>
      input.addEventListener('input', () => {
        checkValidity(inputs, submit);
      })
    );

    checkValidity(inputs, submit); // Check on page load
  });
}

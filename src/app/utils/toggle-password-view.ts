export function togglePasswordView(inputId: string, iconId: string): void {
    const passwordInput = document.getElementById(inputId) as HTMLInputElement | null;
    const toggleIcon = document.getElementById(iconId) as HTMLImageElement | null;

    if (passwordInput && toggleIcon) {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.src = "playea-ionic/src/assets/NotShowing.png"; // Ícono para "ocultar" cuando se muestra
            toggleIcon.alt = "Ocultar contraseña";
        } else {
            passwordInput.type = "password";
            toggleIcon.src = "playea-ionic/src/assets/Showing.png"; // Ícono para "mostrar" cuando está oculta
            toggleIcon.alt = "Mostrar contraseña";
        }
    } else {
        console.error("Password input or toggle icon not found.");
    }
}

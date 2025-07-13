export function LoginView(error = null) {
    return `
        <div class="login-screen">
            <div class="login-card">
                <h2 class="login-title">Codehoot</h2>
                <p class="login-subtitle">Aprenda. Compita. Conquiste.</p>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" name="password" class="form-control" required>
                    </div>
                    ${error ? `<p class="login-error">${error}</p>` : ''}
                    <button type="submit" class="btn btn-primary btn-block">Entrar</button>
                </form>
            </div>
        </div>
        <style>
            .login-screen {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .login-card {
                width: 100%;
                max-width: 400px;
                padding: 2.5rem;
                background: var(--bg-glass);
                backdrop-filter: blur(15px);
                border: 1px solid var(--border-glass);
                border-radius: 1rem;
            }
            .login-title {
                text-align: center;
                font-size: 2.5rem;
                font-weight: 900;
                color: var(--text-light);
                margin-bottom: 0.5rem;
            }
            .login-subtitle {
                text-align: center;
                color: var(--text-dark);
                margin-top: 0;
                margin-bottom: 2rem;
            }
            .login-error {
                color: var(--danger-color);
                text-align: center;
                margin-bottom: 1rem;
            }
            .btn-block {
                width: 100%;
                padding: 0.8rem;
                font-size: 1.1rem;
            }
        </style>
    `;
}

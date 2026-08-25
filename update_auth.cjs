const fs = require("fs");
let content = fs.readFileSync("src/services/translations.js", "utf8");

const enKeys = `
    authGoogle: "Continue with Google",
    authOrEmail: "or email",
    authEmailLabel: "Email Address",
    authPassLabel: "Password",
    authBtnLogin: "Sign In & Win",
    authBtnSignup: "Create SuperMacho Account",
    authDemo: "Try Quick Interactive Demo Dashboard",
    authNoAccount: "Don't have an account?",
    authSignupNow: "Sign up now",
    authHasAccount: "Already have an account?",
    authSignIn: "Sign in",`;

const esKeys = `
    authGoogle: "Continuar con Google",
    authOrEmail: "o correo electrónico",
    authEmailLabel: "Correo Electrónico",
    authPassLabel: "Contraseña",
    authBtnLogin: "Inicia Sesión y Gana",
    authBtnSignup: "Crear Cuenta SuperMacho",
    authDemo: "Probar Dashboard Demo Interactivo",
    authNoAccount: "¿No tienes cuenta?",
    authSignupNow: "Regístrate ahora",
    authHasAccount: "¿Ya tienes cuenta?",
    authSignIn: "Iniciar sesión",`;

const ptKeys = `
    authGoogle: "Continuar com o Google",
    authOrEmail: "ou e-mail",
    authEmailLabel: "Endereço de E-mail",
    authPassLabel: "Senha",
    authBtnLogin: "Faça Login e Ganhe",
    authBtnSignup: "Criar Conta SuperMacho",
    authDemo: "Experimentar Dashboard Demo Interativo",
    authNoAccount: "Não tem uma conta?",
    authSignupNow: "Inscreva-se agora",
    authHasAccount: "Já tem uma conta?",
    authSignIn: "Fazer login",`;

content = content.replace(\`authSignupSub: "Start winning your fantasy league & let's make money!",\`, \`authSignupSub: "Start winning your fantasy league & let's make money!",\n\` + enKeys);

content = content.replace(\`authSignupSub: "¡Empieza a ganar tu liga de fantasy y hagamos dinero!",\`, \`authSignupSub: "¡Empieza a ganar tu liga de fantasy y hagamos dinero!",\n\` + esKeys);

content = content.replace(\`authSignupSub: "Comece a ganhar na sua liga de fantasy e vamos fazer dinheiro!",\`, \`authSignupSub: "Comece a ganhar na sua liga de fantasy e vamos fazer dinheiro!",\n\` + ptKeys);

fs.writeFileSync("src/services/translations.js", content, "utf8");

const emailRegEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const emailRegEx_Standart = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegEx = /^\+\d{1,4}[-\s.]*\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{2}[-.\s]*\d{2}$/;
const digitRegEx = /^\d+$/;
const lettersRegEx = /^\p{L}+$/u;
const symbolsRegEx = /^[+!@#$%^&*(),.?":{}|<>-]+$/;
const passwordRegEx = /^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:,.<>?/|~]{8,128}$/;
const passwordRegEx_withRules = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:,.<>?/|~])[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:,.<>?/|~]{8,128}$/;

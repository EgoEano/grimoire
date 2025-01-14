const emailRegEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const phoneRegEx = /^\+\d{1,4}[-\s.]*\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{2}[-.\s]*\d{2}$/;
const digitRegEx = /^\d+$/;
const lettersRegEx = /^\p{L}+$/u;
const symbolsRegEx = /^[+!@#$%^&*(),.?":{}|<>-]+$/;
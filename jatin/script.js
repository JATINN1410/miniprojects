// Get the button element and header element
const colorChangeButton = document.getElementById("colorChangeButton");
const header = document.querySelector("header");

// Get all FAQ question and answer elements
const faqQuestions = document.querySelectorAll(".faq-question");
const faqAnswers = document.querySelectorAll(".faq-answer");

// Define an array of colors
const colors = ["#333", "#FF5733", "#33FF57", "#5733FF"];

// Add click event listener to the button
colorChangeButton.addEventListener("click", () => {
    // Generate a random index to pick a color from the array
    const randomIndex = Math.floor(Math.random() * colors.length);

    // Change the header background color
    header.style.backgroundColor = colors[randomIndex];
});

// Add click event listener to each question
faqQuestions.forEach((question, index) => {
    question.addEventListener("click", () => {
        // Toggle the visibility of the corresponding answer
        faqAnswers[index].classList.toggle("visible");
    });
});

// Form validation
const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (validateForm()) {
        // Send form data to server or perform other actions
        alert("Form submitted successfully!");
        contactForm.reset();
    }
});

function validateForm() {
    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const messageValue = messageInput.value.trim();

    if (nameValue === "" || emailValue === "" || messageValue === "") {
        alert("Please fill out all fields.");
        return false;
    }

    if (!isValidEmail(emailValue)) {
        alert("Please enter a valid email address.");
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

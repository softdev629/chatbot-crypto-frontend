import bot from "./assets/bot.png";
import user from "./assets/user.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// loading animation effect
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// text typing effect
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      ++index;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generates unique id for each chat
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// generates div for AI & Human
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
  `;
}

// handles user submit
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const prompt = data.get("prompt").trim();

  if (prompt === "") {
    form.reset();
    return;
  }

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, "User: " + prompt);

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const formData = new FormData();
  formData.append("prompt", data.get("prompt"));

  // fetch data from server -> bot's response
  const response = await fetch("http://localhost:5000/mad", {
    method: "POST",
    body: formData,
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.answer.trim();

    typeText(messageDiv, "Bot: " + parsedData);
  } else {
    const err = await response.json();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

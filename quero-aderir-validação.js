
  $(document).ready(function () {
    $("#email-input").on("input", function () {
      var email = $(this).val();
      var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!pattern.test(email)) {
        console.log("Please enter a valid email address.")
        // $("#error-msg").text("Please enter a valid email address.");
        $("#clear-email").prop("disabled", true);
      } else {
        console.log("Valid email")
        // $("#error-msg").text("");
        $("#clear-email").prop("disabled", false);
      }
    });
});


 const btn = document.getElementById("clear-email");

        btn.addEventListener("click", function handleClick(event) {
          event.preventDefault();

          const emailInput = document.getElementById("email-input");
          emailInput.value = "";
        });


        function testWork(){
            console.log("Iam loaded")
        }



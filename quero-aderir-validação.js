
  $(document).ready(function () {
    $("#email-input").on("input", function () {
      var email = $(this).val();
      var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!pattern.test(email)) {
        console.log("Please enter a valid email address.")
       if ($("#error-msg").length == 0) {
        $("<div>").attr("id", "error-msg").addClass("error-msg").text("Please enter a valid email address.").insertAfter("#email-input");
      }
        $("#clear-email").prop("disabled", true);
      } else {
        console.log("Valid email")
            $("#error-msg").remove();
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



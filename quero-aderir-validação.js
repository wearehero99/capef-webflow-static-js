
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



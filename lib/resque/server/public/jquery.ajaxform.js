jQuery.fn.ajaxForm = function(opts) {
  var options = {
    submit_on_change: true
  };

  if (opts) {
    jQuery.extend(options, opts);
  }

  return $(this).each(function(){
    var the_form = $(this);

    the_form.submit(function() {
      //console.log("submit", the_form.serialize());
      var submit_type = the_form.find("input[name=_method]").attr("value") || the_form.attr("method");
      the_form.find("input:not([type=hidden]), textarea").addClass("submitting").before("<img class=\"spinner\" src=\"/images/spinner.gif\"/>");
      $.ajax({
        url: the_form.attr("action"),
        type: submit_type,
        data: the_form.serialize(),
        dataType: "html",
        success: function(data){
          the_form.find("img.spinner").remove();
          the_form.find("input:not([type=hidden]), textarea").removeClass("submitting");
          if (options.success) { options.success(data, the_form); }
        },
        error: function(XMLHttpRequest, textStatus) {
          the_form.find("img.spinner").remove();
          the_form.find("input:not([type=hidden]), textarea").addClass("warning");
          if (options.error) { options.error(textStatus); }
  //         searchForm.removeClass("searching");
  //         if (XMLHttpRequest.status === "409") {
  //           showAndRemoveStatusMessage(statusMessage("failure", "search failed", "failure.png"));
        }
      });
      return false;
    });

    if (options.submit_on_change) {
      the_form.change(function(event){
        //console.log("change");
        return the_form.submit();
      });

      the_form.bind('reset', function(event){
        //console.log("reset");
        return the_form.submit();
      });

      if ($.browser.msie) {
        //console.log("IE!")
        /* IE does not support the change event... so we kind of emulate it. */
        the_form.find("input[type=checkbox]").click( function(){
          //console.log("click");
          the_form.change();
          return true;
        });

        the_form.find("input:not([type=checkbox]), textarea, select").blur( function(){
          //console.log("blur");
          the_form.change();
          return false;
        });
      } /* end msie */
      // the_form.find("input[type=checkbox]").click(function(){ the_form.change(); return true; })
      the_form.find("p.submit, input.submit, input[type=submit]").remove();
    }

  });
};

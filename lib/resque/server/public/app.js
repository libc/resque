jQuery.fn.slideUpAndFadeOut = function(speed, easing, callback) {
  return this.animate({opacity: 'hide', height: 'hide'}, speed, easing, callback);
};

$(document).ready(function() {
  $("form.ajax.delete").ajaxForm({
    submit_on_change: false,
    success: function(data, the_form) {
      the_form.closest('li').slideUpAndFadeOut();
    }
  });

  $("form.ajax.retry").ajaxForm({
    submit_on_change: false,
    success: function(data, the_form) {
      the_form.closest('div').html('<p>Retried</p>');
    }
  });
});

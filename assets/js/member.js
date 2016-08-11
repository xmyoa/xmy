$(function(){
	 $('.login-tab a').each(function(e){
            $(this).click(function(){
                $(this).addClass('current').siblings().removeClass('current');
                $('.login-tab-con').eq(e).addClass('current').siblings().removeClass('current');
                $(".error-tips").html('').hide();
            });
        });

        var _username = $("#username");
        var _password = $("#password");
        var _phonenumber = $("#phonenumber");
        var _vcode = $("#vcode");

        $('.login-form .input-group input').keyup(function(){
            $(this).siblings(".error-tips").html('').hide();
        });
		$('.member-form .submit_button').click(function(){
			
            if($('.login-tab-con.current #phonenumber').length>0){
                if(_phonenumber.val()==""){ 
                     _phonenumber.siblings(".error-tips").html('<span class="onError">手机号码不能为空！请重新输入</span>').show();
                    _phonenumber.focus(); 
                    return false; 
                }
                else if (!_phonenumber.val().match(/^(1(([35][0-9])|(47)|[8][01236789]))\d{8}$/)) {
                    _phonenumber.siblings(".error-tips").html('<span class="onError">手机号码格式不正确！请重新输入</span>').show();
                    _phonenumber.focus(); 
                    return false; 
                } 
                else _phonenumber.siblings(".error-tips").html('').hide();
                if(_vcode.val()==""){ 
                     _vcode.siblings(".error-tips").html('<span class="onError">验证码不能为空！请重新输入</span>').show();
                    _vcode.focus(); 
                    return false; 
                }
                else if (!_vcode.val().match(/^.{6}$/)) {
                    _vcode.siblings(".error-tips").html('<span class="onError">验证码长度不正确！请重新输入</span>').show();
                    _vcode.focus(); 
                    return false; 
                } 
                else _vcode.siblings(".error-tips").html('').hide();
            }
            else{
                if(_username.val()==""){ 
                     _username.siblings(".error-tips").html('<span class="onError">用户名不能为空！请重新输入</span>').show();
                    _username.focus(); 
                    return false; 
                }
                else _username.siblings(".error-tips").html('').hide();
                if(_password.val()==""){ 
                     _password.siblings(".error-tips").html('<span class="onError">密码不能为空！请重新输入</span>').show();
                    _password.focus(); 
                    return false; 
                }
                else if (!_password.val().match(/^[\w]{6,12}$/)) {
                    _password.siblings(".error-tips").html('<span class="onError">密码长度不正确！请重新输入</span>').show();
                    _password.focus(); 
                    return false; 
                } 
                else _username.siblings(".error-tips").html('').hide();
            }
		});
})
       
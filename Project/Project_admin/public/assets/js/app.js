/*
 Template Name: Veltrix - Responsive Bootstrap 4 Admin Dashboard
 Author: Themesbrand
 Website: www.themesbrand.com
 File: Main js
 */


!function ($) {
    "use strict";

    var MainApp = function () {
        this.$body = $("body"),
            this.$wrapper = $("#wrapper"),
            this.$btnFullScreen = $("#btn-fullscreen"),
            this.$leftMenuButton = $('.button-menu-mobile'),
            this.$menuItem = $('.has_sub > a')
    };

    MainApp.prototype.intSlimscrollmenu = function () {
        $('.slimscroll-menu').slimscroll({
            height: 'auto',
            position: 'right',
            size: "5px",
            color: '#9ea5ab',
            wheelStep: 5,
            touchScrollStep: 50
        });
    },
        MainApp.prototype.initSlimscroll = function () {
            $('.slimscroll').slimscroll({
                height: 'auto',
                position: 'right',
                size: "5px",
                color: '#9ea5ab',
                touchScrollStep: 50
            });
        },

        MainApp.prototype.initMetisMenu = function () {
            //metis menu
            $("#side-menu").metisMenu();
        },

        MainApp.prototype.initLeftMenuCollapse = function () {
            // Left menu collapse
            $('.button-menu-mobile').on('click', function (event) {
                event.preventDefault();
                $("body").toggleClass("enlarged");
            });
        },

        MainApp.prototype.initEnlarge = function () {
            if ($(window).width() < 1025) {
                $('body').addClass('enlarged');
            } else {
                $('body').removeClass('enlarged');
            }
        },

        MainApp.prototype.initActiveMenu = function () {
            // === following js will activate the menu in left side bar based on url ====
            $("#sidebar-menu a").each(function () {
                var pageUrl = window.location.href.split(/[?#]/)[0];
                if (this.href == pageUrl) {
                    $(this).addClass("mm-active");
                    $(this).parent().addClass("mm-active"); // add active to li of the current link
                    $(this).parent().parent().addClass("mm-show");
                    $(this).parent().parent().prev().addClass("mm-active"); // add active class to an anchor
                    $(this).parent().parent().parent().addClass("mm-active");
                    $(this).parent().parent().parent().parent().addClass("mm-show"); // add active to li of the current link
                    $(this).parent().parent().parent().parent().parent().addClass("mm-active");
                }
            });
        },

        MainApp.prototype.initComponents = function () {
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
        },

        //full screen
        MainApp.prototype.initFullScreen = function () {
            var $this = this;
            $this.$btnFullScreen.on("click", function (e) {
                e.preventDefault();

                if (!document.fullscreenElement && /* alternative standard method */ !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    } else if (document.documentElement.mozRequestFullScreen) {
                        document.documentElement.mozRequestFullScreen();
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                } else {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                }
            });
        },



        MainApp.prototype.init = function () {
            this.intSlimscrollmenu();
            this.initSlimscroll();
            this.initMetisMenu();
            this.initLeftMenuCollapse();
            this.initEnlarge();
            this.initActiveMenu();
            this.initComponents();
            this.initFullScreen();
            Waves.init();
        },




        //init
        $.MainApp = new MainApp, $.MainApp.Constructor = MainApp
}(window.jQuery),

    //initializing
    function ($) {
        "use strict";
        $.MainApp.init();
    }(window.jQuery);




function setStatus(id) {
    //    var user_id=documsent.getElementById('changeStatus').value;
    $.ajax({
        url: base_url+'changeUserStatus',
        method: "POST",
        data: { user_pub_id: id },
        success: function (data) {
            location.reload(true);
        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
}

function setCatStatus(id) {
    //    var user_id=document.getElementById('changeStatus').value;
    $.ajax({

        url: base_url+'changeCatStatus',
        method: "POST",
        data: { id: id },
        success: function (data) {
            // window.location.href='/tables-datatable';
            //  console.log('sss');
            location.reload(true);

        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
}

function setBannerStatus(id) {
    //    var user_id=documsent.getElementById('changeStatus').value;
    $.ajax({

        url: base_url+'changeBannerStatus',
        method: "POST",
        data: { id: id },
        success: function (data) {
            // window.location.href='/tables-datatable';
            //  console.log('sss');
            location.reload(true);

        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
}



$('body').on('click','#currencyStatus',function(e){
    e.preventDefault();
    var id = $(this).data('pid');
    $.ajax({
        url: base_url+'changecurrencyStatus',
        method: "POST",
        data: { id: id },
        success: function (data) {
            location.reload(true);
        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
});

$('body').on('click','#packageStatus',function(e){
    e.preventDefault();
    var id = $(this).data('pid');
    $.ajax({

        url: base_url+'changePackageStatus',
        method: "POST",
        data: { id: id },
        success: function (data) {
            // window.location.href='/tables-datatable';
            //  console.log('sss');
            location.reload(true);

        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
});

function changePayoutStatus(id) {
    //    var user_id=documsent.getElementById('changeStatus').value;
    $.ajax({

        url: base_url+'changePayoutRequest',
        method: "POST",
        data: { user_pub_id: id },
        success: function (data) {
            // window.location.href='/tables-datatable';
            //  console.log('sss');
            location.reload(true);

        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
}

$(document).ready(function () {
    $('.mychechk').on('change', function () {

        $('#uid').val('');
        var sThisVal = '';
        $('.mychechk').each(function () {
            if (this.checked) {
                var ll = $(this).val();


                sThisVal = sThisVal + $(this).val() + ',';
                $('#uid').val(sThisVal);

            }
        });
        if (sThisVal != '') {
            $('#send_msg').prop("disabled", false);
        } else {
            $('#send_msg').prop("disabled", true);
        }
    });
});

$(document).ready(function () {
    $('input#textfield').on('keyup', function () {
        var charCount = $(this).val().replace(/^(\s*)/g, '').length;
        $(".result").text(charCount + " ");
        $("#textfield").css({ "border-color": "#007bff" });
    });
});
$(document).ready(function () {
    $('textarea#textfield1').on('keyup', function () {
        var charCount = $(this).val().replace(/^(\s*)/g, '').length;
        $(".result1").text(charCount + " ");
        $("#textfield1").css({ "border-color": "#007bff" });
    });
});


$(function () {

    //button select all or cancel
    $("#select-all").click(function () {
        var all = $("input.select-all")[0];
        all.checked = !all.checked
        var checked = all.checked;
        $("input.select-item").each(function (index, item) {
            item.checked = checked;
        });
    });

    //button select invert
    $("#select-invert").click(function () {
        $("input.select-item").each(function (index, item) {
            item.checked = !item.checked;
        });
        checkSelected();
    });

    //button get selected info
    $("#selected").click(function () {
        var items = [];
        $("input.select-item:checked:checked").each(function (index, item) {
            items[index] = item.value;
        });
        if (items.length < 1) {
            // alert("no selected items!!!");
            swal("Warning", "Please select user to send notification", "error");
            jQuery('#msgmodal').modal('hide');
        } else {
            jQuery('#msgmodal').modal('show');
            jQuery('#type_of_com').val('sms');
        }
    });

    //column checkbox select all or cancel
    $("input.select-all").click(function () {
        var checked = this.checked;
        $("input.select-item").each(function (index, item) {
            item.checked = checked;
        });
    });

    //check selected items
    $("input.select-item").click(function () {
        var checked = this.checked;
        console.log(checked);
        checkSelected();
    });

    //check is all selected
    function checkSelected() {
        var all = $("input.select-all")[0];
        var total = $("input.select-item").length;
        var len = $("input.select-item:checked:checked").length;
        console.log("total:" + total);
        console.log("len:" + len);
        all.checked = len === total;
    }
});


jQuery(document).ready(function () {
    jQuery('#allusers').dataTable({
    });

    jQuery('#notification_table1').dataTable({
        "lengthMenu": [[10, 50, 100, -1], [10, 50, 100, "All"]],
    });

    var data =
    {
        mobile: [], msg: '', title: ''
    }
    jQuery(document).on('click', '#select_all', function () {
        if (jQuery(this).prop('checked') == true) {
            jQuery('.notification_check').each(function (index, el) {
                jQuery(this).prop('checked', true);
                var mobile = jQuery(this).parent().prev().text();
                data.mobile.push(mobile);
            });
        }
        else {
            jQuery('.notification_check').each(function (index, el) {
                jQuery(this).prop('checked', false);
                data.mobile = [];
            });
        }
    });

    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    jQuery(document).on('click', '.notification_check', function () {
        if (jQuery(this).prop('checked') == true) {
            var mobile = jQuery(this).parent().prev().text();
            data.mobile.push(mobile);
        }
        else {
            var mobile
            var mobile = jQuery(this).parent().prev().text();
            data.mobile.remove(mobile);
        }
    });

    jQuery(document).on('click', '#notify-user', function () {
        var msg = jQuery('#msgmodal textarea').val();
        data.msg = msg;

        var title = jQuery('#msgmodal input').val();
        data.title = title;

        $.ajax({
            url: base_url + 'Admin/firebase',
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (data) {
                s
                swal("Success", "Notification send successfully.", "success");
                swal({
                    title: "Success",
                    text: "Notification send successfully.",
                    type: "success",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "OK",
                    closeOnConfirm: true,
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            window.location.href = base_url + "Admin/notifaction";
                        }
                    });
                data.mobile = []; data.title = ''; data.msg = '';
            }
        })
    });
});


function supportticket(id) {
    //    var user_id=documsent.getElementById('changeStatus').value;
    $.ajax({

        url: base_url+'updatedSupport',
        method: "POST",
        data: { user_pub_id: id },
        success: function (data) {
            // window.location.href='/tables-datatable';
            //  console.log('sss');
            location.reload(true);
        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
}
$(document).ready(function () {
    $(".selected").each(function (index) {
        $(this).on("click", function () {
            var boolKey = $(this).data('selected');
            var mammalKey = $(this).attr('id');
            var atten = $(this).attr('value');
            alert(mammalKey);
            alert(atten);
            setId(mammalKey, atten);
        });
    });

    $('body').on('click', '.coupon_delete', function (e) {
        e.preventDefault();
        var coupon = $(this).data('coupon');
        $.ajax({
            url: base_url+'delete_coupon',
            method: "POST",
            data: { coupon: coupon },
            success: function (data) {
                location.reload(true);
            },
            error: function (e) {
                alert(e.toSourceCode);
            }
        });
    });

    $('body').on('submit', '#coupon_form', function (e) {
        e.preventDefault();
        $.ajax({
            url: base_url+'update_coupon',
            method: "POST",
            data: $('#coupon_form').serialize(),
            success: function (data) {
                window.location.href=base_url+'coupon';
            },
            error: function (e) {
                alert(e.toSourceCode);
            }
        });
    });

    $('body').on('submit', '#Customer_add', function (e) {
        e.preventDefault();
        $.ajax({
            url: base_url+'Customer_store',
            method: "POST",
            data: $('#Customer_add').serialize(),
            success: function (data) {
                if(data.status == 'true'){
                    window.location.href=base_url+'Customer';
                } else {
                    alert(data.message);
                }
            },
            error: function (e) {
                alert(e.toSourceCode);
            }
        });
    });
});

function setCouponStatus(id,status) {
    $.ajax({
        url: base_url+'update_coupon_status',
        method: "POST",
        data: { id: id, status:status },
        success: function (data) {
            location.reload(true);
        },
        error: function (e) {
            alert(e.toSourceCode);
        }
    });
}

var status = "";
var support_pub_id = "";
function setId(x, y) {
    // alert("setId");
    status = x;
    id = y;

    $.ajax({
        url: base_url+'updatedSupport',
        method: "POST",
        data: { status: status, id: id },
        success: function (data) {
            // window.location.href='/ticket';
        }
    })
}

$(document).ready(function () {
    var page;
    var t = $('.city_table_list').on('preXhr.dt', function (e, settings, data) {
        data.page = page;
    }).DataTable({
        "dom": "<'row'<'col-md-4 col-sm-12 col-xs-12'B><'col-md-4 col-sm-6 col-xs-12'l><'col-md-4 col-sm-6 col-xs-12'f>r><'table-scrollable't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",
        "colReoder":true,
        "pageLength": 10,
        "processing": true,
        "serverSide": true,
        "paging": true,
        "pagingType": "full",
        "lengthMenu": [[10, 25, 50, 100 , -1], [10, 25, 50, 100]],
        drawCallback: function(){
            $('.paginate_button.first:not(.disabled) a', this.api().table().container())          
            .on('click', function(){
                page = 'first';
                console.log(page);
            });
            $('.paginate_button.previous:not(.disabled) a', this.api().table().container())          
            .on('click', function(){
                page = 'previous';
                console.log(page);
            });
            $('.paginate_button.next:not(.disabled) a', this.api().table().container())          
            .on('click', function(){
                page = 'next';
                console.log(page);
            });
            $('.paginate_button.last:not(.disabled) a', this.api().table().container())          
            .on('click', function(){
                page = 'last';
                console.log(page);
            });       
        },
        "ajax": {
            "type": "GET",
            "url" :'/getCustomerList',
        },
        'columns':
        [
            { "data": "check","defaultContent": "", 'name': 'ID' },
            { "data": "name","defaultContent": "", 'name': 'name'},
            { "data": "email_id","defaultContent": "", 'name': 'email_id'},
            { "data": "mobile_no","defaultContent": "", 'name': 'mobile_no'},
            { "data": "point","defaultContent": "", 'name': 'point' },
            { "data": "status",render:function(data){
                if(data == 1)return `<button class="button">Activate</button>`
                else{return `<button class="deactiv">Deactivate</button>`}
            },},
            { 'data': {'user_pub_id':'user_pub_id',"status":"status"},
            render:function(data){
                if(data.status == 1){
                    return `<div class="dropdown">
                    <button class="dropbtn">Manage</button>
                    <div class="dropdown-content">
                        <a href="/Customer_view/${data.user_pub_id}>">View</a>
                        <a href="/Customer_edit/${data.user_pub_id}>">Edit</a>
                        <a href="/Customer" id="changeStatus"  onclick="setStatus('${data.user_pub_id}')" value="${data.user_pub_id}"  >Deactivate</a>
                    </div>
                    </div>`
                }else{
                    return `<div class="dropdown">
                    <button class="dropbtn">Manage</button>
                    <div class="dropdown-content">
                        <a href="/Customer_view/${data.user_pub_id}>">View</a>
                        <a href="/Customer_edit/${data.user_pub_id}>">Edit</a>
                        <a href="/Customer" id="changeStatus"  onclick="setStatus('${data.user_pub_id}')" value="${data.user_pub_id}"  >Active</a>
                    </div>
                    </div>`
                }
            },},
        ],
        "buttons": [
            {
                extend: 'excel',
                className: 'btn-default btn-excel'
            },
            {
                extend: 'pdf',
                className: 'btn-default btn-pdf'
            },
            {
                extend: 'print',
                className: 'btn-default btn-print'
            },
        ],
        "columnDefs": [
            {
                "className": "actioncell",
                "orderable": false,
                "searchable": false,
                "sortable": false,
                "targets": [0],
                "width": "5%",
            },
        ],
        "order": [ 1, 'asc' ],
    });
    t.on('draw', function () {
        t.column(0, { search: 'applied', order: 'applied' }).nodes().each(
            function (cell, i) {
                cell.innerHTML = i + 1;
            }
        );
    });
    //paging
    // $('#next').on('click', function () {
    //     t.page('next').draw('page');
    // });
    // $('#previous').on('click', function () {
    //     t.page('previous').draw('page');
    // });
 });

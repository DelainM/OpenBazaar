


// ======================== Data ======================== 
// 
// VERSION : OBCv 0.1

//Debug settings, 0 is disabled, 1 is errors, 2 is warnings, 3 is info+
var debug_level = 3
var debug_levels = ['disabled',"ERROR  ","WARNING","INFO   "];

// ======================== Main Docoument Functions ======================== 

//when document ready, run this
$(function() {
    //By default, show the script generator
    $("#page_generator").fadeIn({duration:500});
    
  
    //Create list of available templates
    form_templates_list_generate();
    
    //If no keypair exist, prompt for one at startup,
    if(localStorage.PGP_keypair === undefined)
        {
        $("#popup_content").html($("#template_popup_pgp_load").html());
        $("#popup_modal").modal("show");
        }
   
   
   //Set options to stored values
    if(localStorage.options !==undefined){
        //for each option
        $.each(JSON.parse(localStorage.options),function(i,v){
            //Set the value of the div id for this index to its value
            $("#"+i).val(v);
        });
    }
    
});


//Function for managing the changes of pages/menu
function showMenu(div){
    //First remove all active elements from the menu
    $(".nav_container li").removeClass("active");
    
    //Hide all the page sections, 
    $('.page_wrap:not(:hidden)').fadeOut(function(){
        //if the div is the options
        if(div==="page_options")
            //load the saved contracts into the options menu
            $('#options_contract_list').html(con_manage_html_list());
        //Once hide is completed, fade in the correct div
        $('#'+div).fadeIn();
        //Add the actie class the the appropriate meny div
        $("#menu_li_"+div).addClass("active");
    });
}


function set_option(opt){
    //Prepare an array variable
    var options = {};
    
    //if there is already local options stored,
    if(localStorage.options!==undefined)
        //parse the data to the options var
        options = JSON.parse(localStorage.options);
    
    
    //Set the option into the array
    options[opt]=$("#" + opt).val();
    //Write all options back to local storage
    localStorage.options = JSON.stringify(options);
    
}



// ======================== PGP Functions ======================== 
// 
// 
//  function for loading a PGP key
function pgp_file_load(){
    //Get the file to a var
    var file = $('#pgp_key_pair').get(0).files[0];
    
    //Create a file reader for reading the file
    var r = new FileReader();
   
   
    // Set the onload function for when the file has been read by the reader
    r.onload = function(f){
        //Store the PGP keys in temporary val
        
        //
        //log('3',f.target.result);
        //var keysstring = f.target.result;
        //var keysstring = '-----BEGIN PGP PUBLIC KEY BLOCK----- \r\n Version: Mailvelope v0.8.2';
        var pub_key = f.target.result.match(new RegExp('-----BEGIN PGP PUBLIC KEY BLOCK-----[\r\n](.*[\r\n]){2,}-----END PGP PUBLIC KEY BLOCK-----'))[0];
        var priv_key = f.target.result.match(new RegExp('-----BEGIN PGP PRIVATE KEY BLOCK-----[\r\n](.*[\r\n]){2,}-----END PGP PRIVATE KEY BLOCK-----'))[0];
        
        //If either of the keys length is less than 100 than we did not get them
        if(pub_key.length < 100 || priv_key.length < 100){
           log('2',"failed to load keys");
        }
        //else store the keys
        else {
            //Store the keys
            localStorage.PGP_keypair = JSON.stringify([pub_key,priv_key]);
            location.reload();
        }
        
    }; 
     
    //Read the file as a text
     r.readAsText(file);
    
}



// ======================== Data Functions (Retrieve/set)======================== 
// 
// These functions are specifically for the storing and recalling data out of the HTML5 storage locations contract

function con_data_current_get(sec,id){
    var data = data_parse(localStorage.getItem("contract_current"));
    
    //if data is undefined, return a blank array
    if(data===null)return undefined;
    //If section is defined
    else if( sec!==undefined){
        
        var data = data[sec];
        
        //If data is now set to the section, and an id is set
        if(data !== undefined && id!==undefined){
            data = data[id];
        }
        
    }
    //Return the result
    return data;
}

function con_data_current_set(sec,id,val){
    if(sec===undefined || id===undefined||val===undefined){
        log('1',"Failed to set data, one of the required fields is undefined");
        log('1',"Received following values : sec = " + sec + " : id =" + id  + " : val =" + val );
        return false;
    }
    //Else set the data and return true
    else{
        //Get the current set of data
        var data = con_data_current_get();
        
        //If the data is null, this means we need to create an array on the data var
        if(data===null || data===undefined)
            data={};
        
        //now check if the sub key is set, if not, create it as an object array
        if(data[sec]===undefined)data[sec]={};
        
        //Add/change the date in the existing structure
        //If the val is a string, add it
        if($.type(val)==="string")data[sec][id]=val;
        //If the value is false, delete it
        if(val===false){
            var temp = {};
            $.each(data[sec],function(n,v){if(n!==id)temp[n]=v;});
            data[sec]=temp;
        }
        
        
        //Save/set the data back into the HTML
        localStorage.setItem("contract_current", data_encode(data));
        
        log('3',JSON.stringify(con_data_current_get()));
        
        return true;
    }    
}


//Returns an array of contract names that are stored,
function con_data_get_list(){
    return data_parse(localStorage.getItem("saved_contracts"))
}

//Returns an array of contract names that are stored,
function con_data_get(contract_name){
    return data_parse(localStorage.getItem("contract_" + contract_name))
}

//Sets the current contract to work on, overwriting any previous data in the current contract holder
function con_data_set_current(contract_name){
    //Save the contract array
    localStorage.setItem("contract_current", data_encode(con_data_get(contract_name)));
}

//Function renames a contract
function con_data_rename_contract(existing_name,new_name){
    
    //Check that both existing and new names are set
    if(existing_name === undefined || new_name === undefined){
        log('1',"Rename of contract could not complete as one of the values is undefined : Existing Name = '" + existing_name + "' and new name = '" + new_name + "'.")
        return false;
    }
    
    //Get the contract data to a var
    var con_data = con_data_get(existing_name);
    
    //Save the new contract
    if(con_data_save(new_name,con_data)){
        //Delete the old contract and return true
        con_data_delete_contract(existing_name);
        
        log('3',"Renamed contract '" + existing_name + "' to '" + new_name + "'");
        //Reload the contract list

        $('#options_contract_list').html(con_manage_html_list());
        return true;
    }
    
    else return false;
    
}

//Function renames a contract
function con_data_delete_contract(contract_name){
    //Prepare a var for writing back to the list of saved contracts
    var contract_list = [];
    
    var existing_list = con_data_get_list();
    
    log('1',JSON.stringify(existing_list));
    
    //for each value in the list
    $.each(existing_list,function(i,v){
        console.log("Test here " + v);
        //Check if the contract name matches this element of the array
        if(v!==contract_name){
            
            console.log("Added " + v + " back into list of contracts");
            //Add this contract back into the array
            contract_list.push(v);
            
        }
        
        //If this did match, it measn this is the one to delete, just add a log entry
        else log('2',"Removing contract '"+v+"' from the list of saved contracts");
    });
    
    //If the variable we prepared length is less than the original, it means the item exists to delete
    if(contract_list.length < existing_list.length){
        
        //Store the updated list
        localStorage.setItem("saved_contracts", data_encode(contract_list));
          //Remove the contract from the HTML5 / Local storage
        localStorage.removeItem("contract_" + contract_name);
        
        //Report this in the warning log
        log('2',"Removing contract data for contract 'contract_"+contract_name+"'");
        
        //Return true;
        //Reload the contract list
            $('#options_contract_list').html(con_manage_html_list());
        return true;
    }
    
    else {
        log('3',"Could not find contract '"+contract_name+"' in array of saved contracts, did not delete")
        return false;
    }
}


//Saves the current contract into storage as the contract name
//Returns true if successful, returns false or string if failed.
function con_data_save(contract_name,data){
     //Save the data contract as the name
    
    //If the data is not present, get the current contract data
    if(data===undefined || data===null)data = con_data_current_get();
    
    //Get the current contracts
    var saved = con_data_get_list();
    
    var found = false;
        //check if the name already exists,
    if(saved!==null)$.each(saved,function(i,cn){
            if(cn===contract_name)found=true;
        });
    
    //else set saved as an array so we can push data into it
    else saved=[];
    //if the name does not exist in the array, add the data to the new contract
    if(found===false)saved.push(contract_name);
    log('3',"adding contract " + contract_name + " to list of saved contracts");
    
    //Save the contract array
    localStorage.setItem("saved_contracts", data_encode(saved));
    
    //Save the contract array
    localStorage.setItem("contract_"+contract_name, data_encode(data));
    
    return true;
}

//Returns an array of currently saved Keypairs
function pgp_key_get_list(){
    
}

//Returns a two element array of PGP Key pair that has been stored with the name defined, 
// returns false if no keys found
function pgp_key_get(name){
    
}

//Returns an array of currently saved Keypairs
function pgp_key_delete(name){
    
}

//Returns an array of currently saved Keypairs
function pgp_key_get_list(){
    
}


//Wipes the current contract  in the HTML 5 storage
function con_data_current_clear(){
    localStorage.setItem("contract_current", "");
}

//Decodes the data into an array

function data_parse(data){
    //Decodes the storage into array
    if(data===undefined || data === null || data==="")return {};
    else return JSON.parse(data)
       
}

function data_encode(data){
    //encodes the data for storage as a string
    return JSON.stringify(data);
}

// ======================== Contract template Functions ======================== 
// 
// 

function form_templates_list_generate(){
    //foreach template
    $.each(contract_templates, function(k,t){
       //for each, add an LI to the template list
       $("#template_menu ul").append("<li><a onclick=\"template_load('"+k+"')\">"+t.name+"</a></li>")
       
    });
    //Load the default template screen
    template_load();
    
}


//Function loads data into the template screen
function template_load(template_key,section){
    //Set the data var up as the default view, if nothing over rides this, it will be shown
    var data = $("#contract_welcome").html();
    
    //If the key is the raw, set the raw contract compiler as the data
    if(template_key==='raw'){
        
        //if section is undefiend, set it as root
        if(section===undefined)section==="root";
        
        data = template_html_raw(section);
        
    }
    //Else we need to get the contract tempalte
    else if (template_key!==undefined){
        
        //We get the Template HTML, and write fields to the 
        
        var con_tem = get_contract_template(template_key);
        
        //If we did not get a template, report an error
        if(con_tem===undefined)alert("Error finding this template.");
        
        else{
            //set the template as the data view
            data = template_html(con_tem);
        }
    }
    
    
    //For fun, hide any popups that may have gotten stuck
    $(".popover_wrap").popover('hide');
    
    
    $("#contract_data").fadeOut(200,function(){$("#contract_data").html(data).fadeIn(200);});
    
}






//function returns HTML for the template with the active section if section is defined, 
function template_html(template){
    //Get the original HTML 
    var origHTML = $('#contract_template_container').html();
    
   
    // Function returns a thehtml for an actual item
    function create_item_HTML(id, data){
        
        //Expects to have a string ID that can be used as HTML id, and data to have  name:, description:, and inputs array
        var item_html = "<p>"+data.input;
        var raw_val_form = "";
        //For each field availble in contracts
        $.each(form_gen_elements,function(eN,eD){
            
            //For each section
            $.each(contract_sections,function(sN,sD){
                //If this form element matches a tag within the input string
                if(data.input.indexOf("~~"+sN + ":" + eD.dataID+"~~") > -1){

                    //Get the type to av ariable
                    var type = form_gen_get_type(eD.type);

                    
                    var fieldhtml = document.createElement('div');

                     //Get the field as a popover input field (second boolean True in the form_html_get_input)
                    $(fieldhtml).html($("#form_input_template_popover").html());
                    
                    //Replace the id of the input 
                    $(fieldhtml).find("#input_popover_field_id").attr("id","input_popover_" + eD.dataID);


                     //variable for existing value, 
                    var existing_val = $(".raw_input #"+eD.dataID).val();
                    //If the existing val is set, 
                    if(existing_val!==undefined && existing_val.length > 0)
                        //Replace the "please set" option in the field HTML
                        $(fieldhtml).find("#input_popover_" + eD.dataID).html(existing_val);
                    //If the field exists in the raw values, Get it and set the javascript array to this value

                    //Get the input HTML using the modified form data to the raw_val_form var 
                    raw_val_form = raw_val_form + form_html_get_input(eD,type);
                    //(fieldhtml);
                    //
                    //Replace the tag with the appropriate input field
                    item_html = item_html.replace("~~" + sN + ":" + eD.dataID+"~~",$(fieldhtml).html());
                }
            });
               
        });
        //item_html = item_html + data.name;
        item_html = item_html + "</p>";
        return {item:item_html,raw:raw_val_form};
    }
    
    
    //Function returns the HTML for a section
    function create_section_HTML(id,data){
        var sec_html = "";
        var raw_html = "";
        sec_html = sec_html + "<h3>" + data.name + "</h3>";
        sec_html = sec_html + "<p>" + data.description + "</p>";
        //now for each input within the section
        $.each(data.inputs,function(iD,iV){
            //Get the html items
            var items_html = create_item_HTML(iD,iV);
            //Add the latest item to the section html var
            sec_html = sec_html + items_html['item'];
            
            //Add the raw HTML to the raw html 
            raw_html = raw_html + items_html['raw'];
        });
        return {sec:sec_html,raw:raw_html};
    }
    
    
    
    var template_sections_html="";
    var template_raw_html="";
    
    //If template.sections exists, for each section
    if(template.sections !== undefined)
        //Prepare a variable for storing template Html data
        var template_sections_html = "";
        
        $.each(template.sections,function(s,d){
           //Get teh section HTML to a var
           var sec_html = create_section_HTML(s,d);
           
           //Add the section HTML to the compiled Section HTML variable
           template_sections_html = template_sections_html + sec_html['sec'];
           
           //Add the raw values to the template_raw_html var
           template_raw_html=template_raw_html + sec_html['raw'];
        });
    
    //Write the contract container to the temporary workspace,
    var workspace = "#contract_template_container #contract_container_content div #template_carousel";
    $(workspace).html(template_sections_html);
    
    
    //Now it is safe to overwrite the raw html container with the values added from the various sections
    $("#form_gen_fields").html(template_raw_html);
    
    
    var final_html = $("#contract_template_container").html();
    
    //Set the template contaner back to how it was
    $("#contract_template_container").html(origHTML);
    return final_html;
        
}


//Function returns a raw html section (different to Template Section)
function template_html_raw(section){
    //Gets the raw HTML for a section and includes template inputs into the already set fields,
    
    //If section is undefined, set it to root
    if(section===undefined)section="root";
    
    //Get the currently set data for this section
    var sec_data = con_data_current_get(section.toLowerCase());
    
    //Get all available fields for this section
    var sec_fields = form_get_fields(section);
    
    //Now send this to the HTML Raw view generator
    var html_sec = template_html_raw_create_view(sec_fields, sec_data,section);
    
    return html_sec;
    
}


//returns HTML code for a section view, including the list of fields avaiable
function template_html_raw_create_view(all_fields,set_fields,sec){
    //Expecting an array of all fields in the first array (all_feilds), and an array of key and value in the second array.
    
    //First reset the form field so that we know there is no previous data in it
    $("#contract_raw_form .row .col-sm-8 #form_gen_fields").html("");
    
    //First reset the form field so that we know there is no previous data in it
    $("#contract_raw_form .row .col-sm-4 #form_gen_field_list").html("");
    
    //Now get the contract raw form to a jquery obj we can work with
    var html_form = document.createElement('div')
    html_form = $(html_form).html($("#contract_raw_form").html());
    
    //Get the html for the list of available fields and append it to the appropriate div in the template html
    $(html_form).find("#form_gen_field_list").append(form_gen_create_list(all_fields));
    
    
    //If the set fields is an array
    if(object_size(set_fields) > 0)
        
        //For each set field/value, add it to the form
        $.each(set_fields,function(n,v){
            //Append it to the HTML Form
            
            $(html_form).find("#form_gen_fields").append(form_gen_input(n,v,sec));
        });
    
    //Now set up the tabs
    //
    //Foreach section
    $.each(contract_sections,function(c,s){
        //Prepare a var to hold the HTML
        var thisHTMLtab = '<li id="'+c+'"';
        
        //If this is the selected section, add the active class to the HTML
        if(sec===c)thisHTMLtab = thisHTMLtab + ' class="active"';
        
        //write the tab data to the HTML we are working with 
        $(html_form).find("#contract_tab_menu").append(thisHTMLtab + '><a onclick="template_load(\'raw\',\''+ c +'\')" href="#">' + s.name +  '</a></li>');
    });
    //We should now have a completed section in the html_form variable
    
    //return the HTML
    return $(html_form).html();
    
    
}




// ======================== Contract Generation Functions ======================== 

//
function gen_load_saved_contract(contractName){
    con_data_set_current(contractName);
    
    $('#popup_modal').modal('hide');
    
    showMenu('page_generator');
    
    template_load('raw');
    
}

//Function html list of possible form elements for the generate contracts page
function form_gen_create_list(list){
    //if the list is undefined, get all
    if(list===undefined)list = form_gen_elements;
    var htmlList = "";
    //For each element
    $.each(list,function(c,o){
        //Add teh link using this element details, and gettin the type
        htmlList = htmlList + form_gen_add_link_line(o);
    });
    //return the html list
    return htmlList;
};





//Function returns the html for a link for a form element to the left menu for adding to the contract
function form_gen_add_link_line(finfo){
    return("<li id='form_gen_add_" + finfo.dataID + "'><a href='#' onclick='gen_add_el(\""+  finfo.dataID  +"\")'>" + finfo.name + "</a></li>");
    
}

//Returns a html select of the contracts, with the ID of the list passed in 
function gen_get_html_contract_select(el_id){
    //Create a var for holding data
    var html_list = document.createElement('div')
    
    //if the element id is not set, set it to something 
    if(el_id===undefined)el_id="contract_select_list";
    
    //Add the start of the list to the HTML
    $(html_list).append("<select class='form-control' id='" + el_id + "'></select")
    
    
    
    //First get all contracts 
    if(con_data_get_list()!==null)
                $.each(con_data_get_list(),function(n,v){
                //add the list item to the html
                log('3',"attempting to find #"+el_id)
                $(html_list).find("#"+el_id).append("<option>" + v + "</option");
            });
    else $(html_list).find("#"+el_id).append("<option id='new_contract' disabled>No saved contracts</option");
    return html_list;
}

//Returns a html list of the contracts
function con_manage_html_list(){
    var contracts = con_data_get_list();
    
    //Create a DOM object to store our html in 
    var html_list = document.createElement('div');
    
    //Add a formatted UL to it.
    $(html_list).append("<ul id='contract_list' class='nav nav-pills nav-stacked'></ul>");
    
    if(contracts!==null && contracts!==undefined && contracts.length>=1)
        $.each(contracts,function(i,n){
            //for each contract, add it to the pills list
            $(html_list).find("#contract_list").append("<li><a href='#' onclick='con_manage_contract_options(\""+n+"\")'>"+n+"</a></li>");
        });
    else 
        $(html_list).find("#contract_list").append("<li><a href='#'>No saved contracts</a></li>");
   
    return $(html_list).html();
    
}

//Loads options for a contract into a modal
function con_manage_contract_options(contract_name){
    
    log('3',"Creating view for saved contract " + contract_name);
    
    //Create a DOM object to store our html in 
    var html_opts = document.createElement('div');
    
    //Get the template_contract_options to the DOM Object,
    $(html_opts).html($("#template_contract_options").html());
    
    //Set various HTML Options
    $(html_opts).find("#input_contract_name_existing").attr('value',contract_name);
     $(html_opts).find("#contract_opt_title").html("Contract : " + contract_name);
    //Set the popup content as the contract options and show
    
    $("#popup_content").html($(html_opts).html());
    $('#popup_modal').modal('show');

    
}


//functions saves the current contract and returns a HTML formatted response
function gen_save_contract_html(name){
    //Check if the name is already taken
    if(con_data_save(name)!==true)log('3',con_data_get(name));
    else{
        
        return '<div class="alert alert-dismissable alert-success"><h3>Contract Saved</h3><p>Succesfully saved the contract as ' + name + '.  You should be able to retrieve this somewhere in the future... Time traveler much?';
    }
}

function gen_add_el(elname,value){
    var element = form_gen_get_element(elname);
   
    if($("#"+element.dataID).html() !== undefined){
        //Show an alert, and return nothing to exit the function
        alert("This field is not allowed to be added twice to a contract");
        return false;
    }

     //Append the HTML to the generator fields
    $("#contract_data").find('#form_gen_fields').append(form_gen_input(elname,value));
}


//Adds a clicked element from the left menu to the contract
function form_gen_input(elname,value,sec){
    //Get the element from the array, and the type
    var element = form_gen_get_element(elname);
    var type = form_gen_get_type(element.type);
    if(sec===undefined)sec = $("#contract_tab_menu .active").attr('id');
    
    
    log('3',"Default value = " + element.default_value);
    //If this section has a value set for it, override the default value
    var defaultValue = con_data_current_get(sec, element.dataID);
    
    if(defaultValue!==undefined && defaultValue!=="")element.default_value = defaultValue;
    
    
    log('3',"Default value = " + element.default_value);
    //Create a DOM object we can work with so we dont mess with live divs
    var html_input = document.createElement('div')
    //Get the basic HTML to the DOM object
    html_input = $(html_input).html(form_html_get_input(element,type));
   
    
    //Add any classes to this field if needed
    $(html_input).find("input").addClass(type.class);
    
    //If a default value is set, set it in the input feild
    if(element.default_value !== undefined){
        //for differnt types, we have to set the data different ways
        switch(type.type){
            case "text":
                 $(html_input).find(".form_gen_input").attr("value", element.default_value);
            break;
            case "textarea":
                 $(html_input).find(".form_gen_input").html(element.default_value);
            break;
            case "select":
                 $(html_input).find(".form_gen_input option[value='"+element.default_value+"']").attr('selected',true);
            break;
        }
        
        
    }
       
        
    //return this input
    return $(html_input).html();
}


//Returns input field
function form_html_get_input(element,type,inputOnly,section){
    
    if(section===undefined)section='root';
    
    //Create an object to store the input html in 
    var html_input = document.createElement('div');
    
    //Get the input field / HTML
    $(html_input).html($("#form_input_template_"+type.type).html());
    
    //if this is a select
    if(type.type==="select"){
        //check if values are set
        if(type.values === undefined)
            log("2","Creating select for " + element.name + " and no values found!");
        
        //else for each value
        else $.each(type.values,function(id,name){$(html_input).find('select').append("<option value='"+id+"'>"+name+"</option>");});
        
    }
    //var inputHtml = $("#form_input_template_"+type.type).html();
    
    
    //If we are not just getting the input
    if(inputOnly!==true){
        //Update the html to be the HTML wrap with the input field within
        $(html_input).html($("#form_input_template_wrap").html().replace("~~formInput~~",$(html_input).html()));
    }
    
    //If the HTMl is undefined, it means there is no template HTML set for this kind of field
    if($(html_input).html() === undefined)log('3',"Error getting template input format #form_input_template_"+type.type);
    
    //Replace the various elements of the html
    $(html_input).html($(html_input).html().replace("field_id",element.dataID).replace("field_id",element.dataID).replace(
            "fieldname",element.name).replace(
            /fieldtype/gm,type.type).replace(
            "field_desc",element.name));
    
    return $(html_input).html();
}


//Deletes a contract item from the current contract
function gen_del_el(cel){
    
    con_data_current_set($("#contract_tab_menu .active").attr('id'),$(cel).parent().parent().find("input").attr("id"),false);
    
    
    $(cel).parent().parent().remove();
    //Delete it from the current contract.
        
}

//Function to generate teh contract
function gen_create_con(){
    //intialise an varialbe to hold an object array of values
    var contract_values = con_data_current_get();
    
    //Check the contract values and get reulst to variable.
    var checks = gen_check_con();
    
    //If the checks did not return true, 
    if(checks!==true && checks !==undefined)$("#xml_contract").html(checks).show();
    
    //If all values are correct ,then show the sign and encrypt modal
    else {
        //Check if we have a public key,
        var pub_key = JSON.parse(localStorage.PGP_keypair)[0];
        if(pub_key!==undefined)
            //Add the public key to the end of the data to parse
            contract_values['PGP_Public_Key']=pub_key;
        //get parsed data
        var parsedValues = gen_parse_values(contract_values);
        
        $("#xml_contract").html(parsedValues).show();
        $("#popup_content").html($("#input_sign_and_encrypt_PGP").html());
        $('#popup_modal').modal('show');
    }
        
}

//Function parses all variables into a particular type (eg JSON, XML, etc) and returns a string of the parsed values
function gen_parse_values(v){
    
    //get the type from the drop down box
    var type=$("#option_contract_format").val();
    
    //Check if the values are a multi dimension array with root section
    if(v['root']!==undefined){
        
        //prepare an array var for storing the values with Root section extracted to the root
        var tmpArr ={OBCv:OBCv};
        
        //now need to move all root values into the root of the tmpArr array
        $.each(v['root'],function(ri,rv){
            tmpArr[ri]=rv;
        });
        
        //Now for each section in v, create the section in the tmp array as long as it is not root
        $.each(v,function(ti,tv){
            if(ti!=="root")tmpArr[ti]=tv;
        });
        
        //Now overwrite v with the new array
        v=tmpArr;
    }
    else v['OBVc']=OBCv;
    
    
    
    //For XML Data
    if(type==="XML"){
        //prepare a variable for storing the number of indentations before a element
        var ind = "";
        
        function get_xml(key,string){
            
            var temp_xml = "";
            
            //Get this input's name
            var el = form_gen_get_element(key);
            //If we got a name, add it as a comment in the XMl document
            if(el!== undefined) temp_xml = temp_xml + ind + "&lt!--" + el.name + "--&gt\r\n";
            //Add the result into the document as XML
            temp_xml = temp_xml + ind + "&lt"+key+"&gt" + string + "&lt/"+key+"&gt\r\n\r\n";
            
            return temp_xml;
        }
        //Prepare a var for holding data, and set the XML data at the head
        var resultData = '&lt?xml version="1.0"  encoding="UTF-8"?&gt\r\n\r\n  &ltdata&gt\r\n\r\n';
        $.each(v,function( index,value ) {
            ind = ind +"  ";
            //First check if there is a root data 
            
            //if value is not a string
            if(typeof value==="string"){
                resultData = resultData + get_xml(index,value);
            }
            //else this is another object that is not the root index
            else{
                //Write the opening tags for this object to the XML
                resultData = resultData + ind + "&lt"+index+"&gt";
                
                //For each section, add the sub values
                $.each(value,function(vk,vv){
                    resultData = resultData + get_xml(vk,vv);
                });
                
                //Write the closing tags for this object to the XML
                resultData = resultData + ind + "&lt/"+index+"&gt\r\n\r\n";
                
            }
            
            ind = ind.slice(0, -2);
        });
        
        //Once completed, return result data
        return resultData + "  &lt/data&gt\r\n\r\n";
    }
    else if(type==="JSON")
        return JSON.stringify(v,null,'\r');
    
    //Else parse in HTML type format
    else{
        var resultData = "";
        $.each(v,function( index,value ) {
            if(typeof value==="string")
                        resultData = resultData + index + " : " + value + "\r\n";
            else{
                resultData = resultData + "<b>" + index + "</b> : \r\n";
                $.each(value,function(i,v){
                    resultData = resultData + "    " + i + " : " + v + "\r\n";
                });
            }
        });
        
        //Once completed, return result data
        return resultData;
    }
}

//function to check the submitted contract fields
//
// Calls gen_check_inputs_required function, which 
function gen_check_con(){
    //Check if all required inputs are present
    var required_inputs_check = gen_check_inputs_required();
    
    //Prepare an array for storing the result of checking all values
    var valid_checks = new Array();
    
    //function to check the values, set
    function run_check(k,val){
        //Prepare a var for storing the validation result
        var res =true;

        //Get the validation result
        res = data_validation(k,val);

        //If the result of validation is not true
        if(res!==true)
            //Add the error to the validation checks variable
            valid_checks.push(res);
    }
    
    
    //for each input that is present, Run the validation check
    $.each(con_data_current_get(),function(i,v){
        //if this is a string, then check it
        
        
        if(typeof v==="string"){
            run_check(k,val);
        }
        
        //If the type is not a string, it must be a second dimension of the arrays
        else{
            
            $.each(v,function(i2,v2){
                run_check(i2,v2);
            });
        }
        
    });
    
    
    
    //If we have errors in the required_inputs_check result, return text/html error
    if(required_inputs_check.length > 0)
        return "Not all required fields are present : <p> " + required_inputs_check.join("<br>") + "</p>";
    
    
    //If we have errors in the valid_checks result, return text/html error
    else if(valid_checks.length > 0 )
        return "Found some errors with Fields :<p> " + valid_checks.join("<br>") + "</p>";
    
    //Else return true :)
    else return true;
    
        
}

//This function should be fired whenever a form data is changed, 
//Runs validation wizard and reports any errors
//Starts by getting the result of the data_validation to a variable
//If the validation is true, we change the color of the input field to green using the gne_form_input_msg function
// If validation is an array, it means it errored, we set the mssages using the same function
//Else if we did not get anything, nothing is right, all validation's should return something (ether, true, false or an array);
function gen_form_data_change(obj){
    //run the validation function
    var validation = data_validation($(obj).attr("id"),$(obj).val());
    
    //log an entry so we can see what is happening
    //If the result is false, something failed spectaculy,
    if(validation===false)alert("Error validating Data, please make sure there are no modifications to the code")
    else if (validation===true){
        
        //Placing these variables within the scope of validation being true
        var id = $(obj).attr("id");
        var input_val = $(obj).val();
        
        //If this is popover, we have to treat it slightly differently
        if($(obj).parent().hasClass('popover-content')){
            
            //Now set the value in the form as the updated val
            if(input_val.length > 0){
                $("#input_popover_"+id).html(input_val);
                //MUST use the "attr" value, otherwise reloads of the HTML content do not load properly
                $(".raw_input #" + id).attr("value", input_val);
            }
            else
            {
                $("#input_popover_"+id).html("Please Set");
            }
            //Hide any popups, need a better solution than this, but okay for alpah product
            $(".popover_wrap").popover('hide');
        }
        
        //save the data to HTML 5 storage
        log('3',"saving Data : Result = " + con_data_current_set($("#contract_tab_menu .active").attr('id'),id,input_val));
        
        
        gen_form_input_msg(obj,'','success');
        return true;
    }
    //else if the result is an array
    else if(Object.prototype.toString.call(validation) === '[object Array]' ){
        gen_form_input_msg(obj,validation.join(),'error');
        return validation.join("<br>");
    }
    //else alert that something went wrong, 
    else{
        alert("something went wrong validating the data")
    }
}



//Function modifies the display parameters of each form element
function gen_form_input_msg(element,msgTxt,status){
    //if Status is success, warning, error, or false
    
    //For ease of coding, get the parent object to a var
    var par = $(element).parent().parent();
    //first, remove any classes that may exist on this obj
    par.removeClass("has-error has-warning has-success");
    
    //If there is a helper, remove it
    $(par).children(".help-block").remove();
    
    //append a help block
    $(par).append('<span class="help-block">'+msgTxt+'</span>');
    
    //if the status is not false, set the new class
    if(status!==false)$(par).addClass("has-"+status);
    
    
}

//Function checks all data validation rules in for the named ID and values, 
//Returns true if validation passed,
//Returns array of errors if validation failed 
//Returns false if elname not found in the array
function data_validation(id,val){
    //Get the element details
    var el = form_gen_get_element(id);
    
    //if el is false, return false
    if(el===false || el===undefined)return false;
    
    //Get the type for the field
    var type = form_gen_get_type(el.type);
    
    //if not type, ,return false
    if(type===false || type===undefined)return false;
    
    //prepare a var for storing any error messages
    var errors = new Array();
    
    //min_len:26
    //max_len:33
    //regex_validation_rule:"^[13][a-zA-Z0-9]{26,33}$"
    //regex_validation_msg:"~field~ must be a valid bitcoin address."}
   
    //if min lenght is set on the element, check it
    if(el.min_len !==undefined){
        
        //Check the value
        if(val < el.min_len)errors.push(el.name + " must be at least " + el.min_len + " characters long \r\n");
    }
    //Else check if the type has a minimum length
    else if(type.min_len !==undefined){
        //Check the value
        if(val < type.min_len)errors.push(el.name + " must be at least " + type.min_len + " characters long \r\n");
    }
   
    //if element max length is set, 
    if(el.max_len !==undefined){
        //Check the value
        if(val > el.max_len)errors.push(el.name + " must be less than or equal to " + el.min_len + " characters long \r\n");
    }
   
    //else if the type max length is set, 
    else if(type.max_len !==undefined){
        //Check the value
        if(val > type.max_len)errors.push(el.name + " must be less than or equal to " + type.min_len + " characters long \r\n");
    }
   
    //If element regex is set
    if(el.regex_validation_rule !==undefined){
        var re = new RegExp(el.regex_validation_rule,'i');
        
        if(re.test(val)===false)errors.push(el.regex_validation_msg.replace("~field~",el.name)+". Invalid match " + val + "\r\n");
    }
    //else if the type regex is set
    if(type.regex_validation_rule !==undefined){
        var re = new RegExp(type.regex_validation_rule,'i');
        
        if(re.test(val)===false)errors.push(type.regex_validation_msg.replace("~field~",el.name)+"  Invalid match " + val + "\r\n");
    }
    
    if(errors.length < 1)return true;
    else return errors;
    
}

function gen_sign_con(){
    
    
    //First, if the keypair is not set
      if(localStorage.PGP_keypair ===undefined)
        {
        //Show the popup to load the keypair
        $("#popup_content").html($("#template_popup_pgp_load").html());
        $("#popup_modal").modal("show");
        }
    else{
        //Get the key to a val
        var pgp_priv_key = openpgp.key.readArmored(JSON.parse(localStorage.PGP_keypair)[1]).keys[0];
        var pgp_pub_key = openpgp.key.readArmored(JSON.parse(localStorage.PGP_keypair)[0]).keys[0];
        
        
        
        //Attempt to decrypt the public key
        if(pgp_priv_key.decrypt($("#pgp_pass").val())){
           
           //Get the contract into whatever format it needs to be in
           var parsedValues = gen_parse_values(con_data_current_get());
            
            //Sign the contract with the private key,
            var pgpSignedContract = openpgp.signClearMessage([pgp_priv_key],parsedValues);
            
            //write the contract to the contract location
            $("#signed_contract_container").html(pgpSignedContract);

            //Set the modal back to blank, and remove all input fields
            $("#popup_content").html($('#result_signed_PGP_contract').html());
            $("#form_gen_fields").html("");

        }
        //If the key decryption failes
        else{
           //notify the user
           $("#decrypt_alert").html('<div class="alert alert-danger alert-dismissable">Failed to decrypt key, do you have the correct passphrase?</div>');
        }
    }
}
  

function gen_check_inputs_required(){
    //Prepare a var for storing messages in 
    var msgs = new Array();
    
    //For each available input field,
     $.each(form_gen_elements,function(c,el){
         var dat = $("#"+el.dataID).html
         
         //If the field does not exist in the html form
         if(dat===undefined)
             if(el.required===true)
                //add the error to the array
                msgs.push("You must include the " + el.name + " field in your contract");
         
    });
    //If the msgs string is set, return it, 
    if(msgs.length >= 1)return msgs;
    //Else return true
    else return true;
}






//Bits
function object_size(obj) {
    var len = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) len++;
    }
    return len;
};

function log(level,msg){
    if(level <= debug_level)console.log(debug_levels[level] + " : " + msg);
}
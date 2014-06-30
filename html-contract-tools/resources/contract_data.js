/*
 *  File holds arrays of contract templates, 
 * 
 * This information is out of date and needs to bo updated once initial version of contract generatore is finalised and tested
 * 
 * At this stage, Contract templates are made up of some base information, and sections of the template
 * Each section is shown to the user sequentially, and once all sections are completed, the contract is generated.
 * Within the sections, you can define a number of inputs, each with thier own, name, input and helper_text. 
 * The name of an input is used as the heading, if no name is set, no heading is displayed
 * The input is a string that any fields identified by ~~fieldID~~ are replaced with input elements.  To only have 
 * input elements, just make the contents of the string ~~fieldID~~ (~~fieldID~~ MUST match an element from the form_gen_elements table)
 * helper_text is just information to help the user fill in the required form
 * 
 * Each template can hold the following values
 * name - A human friendly name for the contract template
 * description - A human friendly description for the contract template
 * author - If you want to put the auther of the template in there, go for it :)
 * date - Date the template was created
 * obv - Open Bizaar version.  This may be required to set what version of OpenBazaar the template is compatible with
 * sections - Object array of Objects, each containing a "section" that has questions to ask the user, this is where you put in all the template bits
 *      Key can be any value, we may use this in the future, but at the moment it is not used
 *      sec_name : This is used as a heading for the section that the user 
 * 
 * 
 */

var OBCv = "0.1-alpha";
// VERSION : OBCv 0.1
// VERSION RELEASE DATE : 0000-00-00



// ====== Contract form Types ======

//Variable that contains possible form types, and validation rules
var form_gen_types = [
    {name:'text',type:"text",class:""},
    {name:'nym', type:"text", class:"has-success", min_len:10 ,max_len:80 , regex_validation_rule:"", regex_validation_msg:"Failed to validate data, please re-enter"},
    {name:'btc_addr', type:"text", class:"has-success", min_len:26 ,max_len:33 , regex_validation_rule:"^[13][a-zA-Z0-9]{26,33}$", regex_validation_msg:"~field~ must be a valid bitcoin address."},
    {name:'currency',type:"text",class:"",regex_validation_rule:'^[0-9]+.?[0-9]+$',regex_validation_msg:"~field~ must be a valid currency value"},
    {name:'checkbox',type:"checkbox",class:""},
    {name:'category',type:"select",class:"",values:{physical_goods:"Physical Goods",services:"Services",currency:"Currency",loans:"Loans",securities:"Securities",prediction:"Prediction",crowdfunding:"Crowdfunding",insurance:"Insurance",other:"Other"}},
    {name:'textarea',type:"textarea",class:""},
    {name:'date',type:"datetime",class:"",regex_validation_rule:'^20[1-6][0-9]-[0-1]?[0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$',regex_validation_msg:"~field~ must be a valid Date Time (eg 2015-11-23 12:33:11)"}    
];


//This is not documented, needs to be checked over by drwasho
var contract_sections = {
    root:{name:"Base",description:"This is the required information in the root of the contract"},
    discovery:{name:"Discovery",description:"How to advertise this contract."},
    ask:{name:"Ask",description:"Describing the item(s) you are selling"},
    offer:{name:"Offers / Bids",description:"Offers or bids for items are sent back through this section"},
    sale:{name:"Sale",description:"This section is used to state the outcome of the sale"},
    conclusion:{name:"Post Sale of item",description:"What occurs after the sale of this item"}   
}


// ====== Contract XML / JSON types ====
//Array of all available types of data for this version of the OB contracts
var form_gen_elements = {
    category:{
        dataID:'category',
        name:"Contract Category", 
        type:'category',
        required:"root",
        default_value:"services",
        default_section:"root",
        allowed_sections:"root",
        allowed_contract_types:"all"
        
    },
    nym:{
        dataID:'nym_id',
        name:"Nym ID", 
        type:'nym',
        required:"root",
        default_section:"root",
        allowed_sections:"root",
        allowed_contract_types:"all"
        
    },
    btc_addr:{
        dataID:'btc_addr',
        name:"Bitcoin address",
        type:"btc_addr",
        required:"root",
        default_section:"root",
        allowed_sections:"sale",
        allowed_contract_types:"all",
        default_value:"1P1GFYLWUhPzFazFKhp2ZHAzaBBKD6AKX1"
    },
    asset_name:{
        dataID:'asset_name',
        name:"Name of item/asset",
        type:"text",
        min_len:5,
        required:"root",
        default_section:"ask",
        allowed_sections:"ask",
        allowed_contract_types:"all"
    },
    asset_description:{
        dataID:'asset_description',
        name:"Item/Asset description",
        type:"textarea",
        required:"root",
        min_len:5,
        default_section:"ask",
        allowed_sections:"ask",
        allowed_contract_types:"all"
    },
    asset_price:{
        dataID:'asset_price',
        name:"Price (in BTC) of item to sell",
        type:"currency",
        required:"ask",
        default_section:"ask",
        allowed_sections:"ask",
        allowed_contract_types:"all"
    },
    contract_exp:{
        dataID:'contract_exp',
        name:"Offer expiry date",
        type:"date",
        required:"root",
        default_section:"root",
        allowed_sections:"root",
        allowed_contract_types:"all",
        default_value:"2014-07-22 12:00:00"
    }      
    };





function get_contract_template(template_name){
    if(contract_templates[template_name]!==undefined)return contract_templates[template_name];
}


    

var contract_templates = new Object();


contract_templates['goods_sale']={
  name:"Sale of goods with Fixed price",
  OBCv:"0.1",
  Type:"Physical Goods",
  description:"For selling an item using a standard Ricardian Contract.  Includes simple sale mechanism",
  sections:{
      ask:{
          name:"Item to sell",
          description:"Please fill in the information about the item you want to sell",
          inputs:[
            {name:"Name",input:"I would like to sell ~~ask:asset_name~~ for the price of ~~ask:asset_price~~ BTC",helper_text:""},
            {name:"Contract Expiry",input:"The item is available for sale until the ~~ask:contract_exp~~",helper_text:""}
          ]
      },
      payments:{
          name:"Payment Details",
          description:"",
          inputs:[
            {name:"Nym / Sudonym",input:"During this sale, I will be known as ~~root:nym_id~~",helper_text:"Not 100% sure what to do with a Nym, but put one in there, can not contain spaces or other special characters"},
            {name:"Bitcoin Address",input:"Payment needs to be made to ~~ask:btc_addr~~",helper_text:"Enter a valid Bitcoin Address where you would like the payment sent to."}
          ]
      }
  }
};


contract_templates['digital_goods_sale']={
  name:"Sale of goods by Auction",
  OBCv:"0.1",
  Type:"Physical Goods",
  description:"For selling digital goods via Bitcoin multi signature transactions.",
  sections:{
      item:{
          name:"Item to sell",
          description:"Please fill in the information about the digital item you want to sell",
          inputs:[
            {name:"Name",input:"I would like to sell ~~ask:asset_name~~ for the price of ~~ask:asset_price~~",helper_text:""},
            {name:"Description",input:"Descriptiong of goods ~~ask:asset_description~~",helper_text:""},
            {name:"Contract Expiry",input:"The item is avialable for sale until the ~~root:contract_exp~~",helper_text:""}
          ]
      },
      finance:{
          name:"Payment Details",
          description:"",
          inputs:[
            {name:"Nym / Sudonym",input:"During this sale, I will be known as ~~nym_id~~",helper_text:"Not 100% sure what to do with a Nym, but put one in there, can not contain spaces or other special characters"},
            {name:"Bitcoin Address",input:"BTC Address : ~~btc_addr~~",helper_text:"Enter a valid Bitcoin Address where you would like the payment sent to."}
          ]
      }
  }
};



//Functions for basic data retrieval

//Function retrievs all form_gen_elements that are relivent for a a section
function form_get_fields(section){
    if(section===undefined)
        return form_gen_elements;
    else{
        //Prepare an object array
        var fields = {};
        
        //For each field that exists
        $.each(form_gen_elements,function(k,d){
            //if the section is included in the allowed_sections field
            if(d['allowed_sections'].toLowerCase().indexOf(section.toLowerCase()) > -1)
                fields[k]=d;
            //Else if all is defined
            else if (d['allowed_sections']==="all")
                fields[k]=d;
        });
        //Now we should have all field elements for this section in an array of ojects, 
        
        
        //Return array of fields
        return fields;
        
    }
}



//Function returns form gen type data
function form_gen_get_type(type){
    var gen_type_obj ;
    $.each(form_gen_types,function(co,t){
        if(type===t.name)gen_type_obj = form_gen_types[co];
    });
    
    if(gen_type_obj!==undefined)return gen_type_obj;
    
    else log('2',"Could not find element type" + type);
    
}

    
//Function returns form gen type data
function form_gen_get_element(elementname){
    var gen_el_obj;
    
    //For each element in the array
    $.each(form_gen_elements,function(c,e){
        //If the element name === the element type, set the var as this element
        if(elementname===e.dataID)gen_el_obj = form_gen_elements[c];
        
    });
    
    if(gen_el_obj!==undefined)return gen_el_obj;
    else log('2',"Could not find element " + elementname);
}

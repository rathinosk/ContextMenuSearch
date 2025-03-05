/**
 * initialise
 * Initialize the options page.
 */
async function initialise(){
	showpage(1);
	await restore_options();
}

/**
 * Chrome storage change listener
 * Listen for changes in Chrome storage and restore options.
 */
chrome.storage.onChanged.addListener(async (changes) => {
    await restore_options();
});

/**
 * showToast
 * Show a toast message with the provided message.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
    var toast = document.getElementById("toast");
    toast.className = "show";
    toast.innerHTML = message;
    setTimeout(function() { toast.className = toast.className.replace("show", ""); }, 3000);
}

/**
 * save_import
 * Save imported configuration.
 */
async function save_import() {
	await setItem("_allSearch", document.getElementById("exporttext").value);
	var status = document.getElementById("status_import");
	showToast("New Configuration Imported");
}

/**
 * save_otheroptions
 * Save other options.
 */
async function save_otheroptions() {	
	var ask_bg = document.getElementById("ask_bg").checked;
	var ask_next = document.getElementById("ask_next").checked;
	var ask_options = document.getElementById("ask_options").checked;

	await setItem("_askBg", ask_bg);
	await setItem("_askNext", ask_next);
	await setItem("_askOptions", ask_options);

	var status = document.getElementById("status_otheroptions");
	showToast("Options Saved");
}

/**
 * save_options
 * Save all options.
 */
async function save_options() {
	var optionsList = document.getElementById("options_list_ul");
	var maxindex = optionsList.childElementCount;
	var _all = new Array(maxindex);
	
	for(var i=0; i<maxindex; i++) {
		curnum = optionsList.children[i].getAttribute('index');
		var itemNode = optionsList.children[i];

		const title = itemNode.querySelector("#listItemName"+curnum)?.value ?? "";
		const link = itemNode.querySelector("#listItemLink"+curnum)?.value ?? "";
		var isEnabled = itemNode.querySelector("#listItemEnab"+curnum)?.checked ?? false;

        _all[i] = new Array(4);
        _all[i][0] = "-1";
        _all[i][1] = title;
        _all[i][2] = link;
        _all[i][3] = isEnabled;
	}
	
	var stringified = JSON.stringify(_all);
	await setItem("_allSearch", stringified);
	
	var ask_bg = document.getElementById("ask_bg").checked;
	var ask_next = document.getElementById("ask_next").checked;
	
	await setItem("_askBg", ask_bg);
	await setItem("_askNext", ask_next);
	
	var status = document.getElementById("status");
	showToast("Options Saved");
}

/**
 * restore_options
 * Restore options from storage.
 */
async function restore_options() {
	var optionsList = document.getElementById("options_list_ul");
	optionsList.innerHTML = "";
	var stringified = await getItem("_allSearch");
	
	document.getElementById("exporttext").value = stringified;
	var parsedArray = JSON.parse(stringified) || [];
	
	for(var i=0; i<parsedArray.length; i++) {
	    const item = parsedArray[i];

	    if(item && item.length == 4 && item[1] != "" && item[2] != "") {
	        add_item(item);
	    } else {
	        add_separator(item);
	    }
	}
	
	var ask_bg = await getItem("_askBg");
	var ask_next = await getItem("_askNext");
	var ask_options = await getItem("_askOptions");

	console.log(ask_bg)

	if(isTrue(ask_bg)) document.getElementById("ask_bg").checked = "true";
	if(isTrue(ask_next)) document.getElementById("ask_next").checked = "true";
	if(isTrue(ask_options)) document.getElementById("ask_options").checked = "true";

    const old_search_items = window.localStorage.getItem("_allsearch");
	document.getElementById("exporttext_old").value = old_search_items;
}

/**
 * isTrue
 * Check if a value is true.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is true, otherwise false.
 */
function isTrue(value) {
    return value === true || value === "true";
}

/**
 * remove
 * Remove an item from the list.
 * @param {number} j - The index of the item to remove.
 */
function remove(j) {
	var listOfSearchOptions = document.getElementById("options_list_ul");
	var listItemToRemove = document.getElementById("listItem"+j);
	console.log("Removing item with index: " + j, listItemToRemove);
	listOfSearchOptions.removeChild(listItemToRemove);
}

/**
 * createListItem
 * Create a new list item.
 * @param {number} curnum - The current index number.
 * @param {boolean} isSeparator - Whether the item is a separator.
 * @returns {HTMLElement} - The new list item element.
 */
function createListItem(curnum, isSeparator) {
    var newListItem = document.createElement('li');
    newListItem.setAttribute('index', curnum);
    newListItem.setAttribute('id', 'listItem' + curnum);

    var innerHTML = `
        <div align='center'>
            <div class='dragIcon' style='width:20px;'></div>
            ${isSeparator ? `
                <hr style='width:138px;'></hr>
                <hr style='width:458px;'></hr>
            ` : `
                <input type='text' class='listItemName' id='listItemName${curnum}' size='20' maxlength='30'>
                <input type='text' class='listItemLink' id='listItemLink${curnum}' size='80' maxlength='5000'>
            `}
            <input type='checkbox' class='checkStyle' id='listItemEnab${curnum}' style='width:40px;'}>
            <button index='${curnum}' class='removeButtonStyle' id='listItemRemoveButton${curnum}' style='width:40px;'>X</button>
        </div>
    `;
    newListItem.innerHTML = innerHTML;

    // Add event listener to the remove button
    newListItem.querySelector(`#listItemRemoveButton${curnum}`).addEventListener('click', function(event) {
        var index = event.target.getAttribute('index');
        remove(index);
    });

    return newListItem;
}

/**
 * add_item
 * Add a new item to the list.
 * @param {Array} item - The item to add.
 */
function add_item(item) {
    var optionsList = document.getElementById('options_list_ul');
    var curnum = optionsList.childElementCount;
    var newListItem = createListItem(curnum, false);
    optionsList.appendChild(newListItem);

    // Set data to the new list item using querySelector
    newListItem.querySelector("#listItemName" + curnum).value = item[1];
    newListItem.querySelector("#listItemLink" + curnum).value = item[2];
    if (item[3]) newListItem.querySelector("#listItemEnab" + curnum).checked = item[3];
}

/**
 * add_separator
 * Add a separator to the list.
 * @param {Array} item - The item to add as a separator.
 */
function add_separator(item) {
    var optionsList = document.getElementById('options_list_ul');
    var curnum = optionsList.childElementCount;
    var newListItem = createListItem(curnum, true);
    optionsList.appendChild(newListItem);

    item = item || ["-1", "", "", true];

    // Set data to the new list item using querySelector
    if (item[3]) newListItem.querySelector("#listItemEnab" + curnum).checked = item[3];
}

/**
 * add_option
 * Add a new option manually.
 */
async function add_option() {
	var nname = document.getElementById("newname").value;
	var nlink = document.getElementById("newlink").value;

	var stringified = await getItem("_allSearch");
	var parsedArray = JSON.parse(stringified);

    var length = (parsedArray?.length ?? 0);
    var newoptions = new Array(length + 1);

    for(var i=0; i<length; i++) {
		newoptions[i] = new Array(4);
		newoptions[i] = parsedArray[i].slice(0);
	}
	
	newoptions[i] = new Array(4);
	newoptions[i][0] = "-1";
	newoptions[i][1] = nname;
	newoptions[i][2] = nlink;
	newoptions[i][3] = true;
	
	var newstring = JSON.stringify(newoptions);
	await setItem("_allSearch", newstring);
	
	document.getElementById("newname").value = "";
	document.getElementById("newlink").value = "";
	var status = document.getElementById("status_addmanually");
	showToast("New Item Added");
	setTimeout(function() {showpage(2);}, 1250);
}

/**
 * resetdefault
 * Reset to default options.
 */
function resetdefault() {
	clearStrg();
	restore_options();
}

/**
 * add_from_list
 * Add options from a predefined list.
 */
async function add_from_list() {
	var numoptions = document.getElementById("numoptions").value;

	for(var j=1; j<=numoptions; j++) {
		if(document.getElementById("s"+j).checked) {
			var nname = document.getElementById("names"+j).value;
			var nlink = document.getElementById("links"+j).value;
		
			var stringified = await getItem("_allSearch");
			var parsedArray = JSON.parse(stringified);

			var length = (parsedArray?.length ?? 0);
			var newoptions = new Array(length + 1);

			for(var i=0; i<length; i++) {
				newoptions[i] = new Array(4);
				newoptions[i] = parsedArray[i].slice(0);
			}
			
			newoptions[i] = new Array(4);
			newoptions[i][0] = "-1";
			newoptions[i][1] = nname;
			newoptions[i][2] = nlink;
			newoptions[i][3] = true;
			
			var newstring = JSON.stringify(newoptions);
			await setItem("_allSearch", newstring);
			document.getElementById("s"+j).checked = false;
		}
	}

	showToast("New Items Added");
	setTimeout(function() {showpage(2);}, 1250);
}

/**
 * showpage
 * Show the specified page.
 * @param {number} page - The page number to show.
 */
function showpage(page) {
	for(var i=1; i<=4; i++) {
		if(i==page) document.getElementById("page"+i).style.display = "block";
		else document.getElementById("page"+i).style.display = "none";
	}	
}

/**
 * Document ready function
 * Initialize the options page and set up event listeners.
 */
$(document).ready(function(){ 
    initialise();
	$(function() {
		$("#options_list_ul").sortable({ opacity: 0.3, cursor: 'move', update: function() {
			console.log("Reordered");
		}});
		
		$("#showpage_1").click(function() {
		  showpage(1);
		});
		
		$("#showpage_2").click(function() {
		  showpage(2);
		});	
		
		$("#showpage_3").click(function() {
		  showpage(3);
		});	
		
		$("#showpage_4").click(function() {
		  showpage(4);
		});
		
		$("#add_option").click(function() {
		  add_option();
		});
		
		$("#add_from_list").click(function() {
		  add_from_list();
		});
		
		$("#save_options").click(function() {
		  save_options();
		});

		$("#add_separator").click(function() {
		  add_separator();
		});

		$("#resetdefault").click(function() {
		  resetdefault();
		});
		
		$("#save_otheroptions").click(function() {
		  save_otheroptions();
		});
		
		$("#save_import").click(function() {
		  save_import();
		});
		
	});
});
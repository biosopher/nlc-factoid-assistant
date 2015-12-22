TextHighlighter = function() {

	// Find the beginning and end of text within the html
	function getNextWord(str,offset) {

		var re = new RegExp("^\\w+"); // Matches word chars a-z, A-Z, 0-9, & underscore
		var word = null;
		while (word == null && offset < str.length ) {
			var substring = str.substring(offset,str.length);
			var reArray = substring.match(re);
			if (reArray != null) {
				word = reArray[0];
				offset += word.length;
			}else{
				var nextChar = str.charAt(offset);
				if (nextChar == "<"){
					// Quickly scan past tags
					offset = scanToEndOfTag(str,offset);
				}else{
					offset++;
				}
			}
		}

		var result = {};
		result.offset = offset;
		result.word = word;
		return result;
	}

	// Scan to end of <...>. htmlOffset equals start of '<'.'
	function scanToEndOfTag(html,htmlOffset) {

		var htmlChar = null;
		while (htmlChar != ">" && htmlOffset < html.length) {
			htmlOffset++;
			htmlChar = html.charAt(htmlOffset);
		}
		return htmlOffset;
	}

	// Find the beginning and end of text within the html
	function addHighlightSpan(html,index,isAdd) {

		var result = {};
		var prefix = html.substring(0,index);
		var suffix = html.substring(index,html.length);
		var span;
		if (isAdd) {
			span = "<span class='highlitSelection'>"
		}else{
			span = "</span>"
		}
		result.html = prefix + span + suffix;
		result.htmlOffset = index + span.length;
		result.spanLength = span.length;
		return result;
	}

	// Find the beginning and end of text within the html
	function addHighlights(html,highlightRange) {

		var highlitHtml = html;
		var spanOpen = false;
		var htmlOffset = highlightRange[0];
		while (htmlOffset < highlightRange[1]) {

			var htmlChar = html.charAt(htmlOffset);
			if (htmlChar != "\n" && htmlChar != "\r" && htmlChar != "\r\n"){
				if (htmlChar == "<"){
					// account for <br> that show as spaces in text.
					var result = addHighlightSpan(html,htmlOffset,false);
					html = result.html;
					htmlOffset = result.htmlOffset;
					highlightRange[1] += result.spanLength;
					spanOpen = false;
					htmlOffset = scanToEndOfTag(html,htmlOffset);
				}else if (!spanOpen) {
					var result = addHighlightSpan(html,htmlOffset,true);
					html = result.html;
					htmlOffset = result.htmlOffset;
					highlightRange[1] += result.spanLength;
					spanOpen = true;
				}
			}
			htmlOffset++;
		}

		if (spanOpen) {
			var result = addHighlightSpan(html,htmlOffset,false);
			html = result.html;
			htmlOffset = result.htmlOffset;
			highlightRange[1] += result.spanLength;
			spanOpen = false;
		}
		return html;
	}

	var hightlight = function(element,text) {

		//console.log("text: " + text);
		// Address known escaped HTML chars that will be in the html
		text = text.replace("&","&amp;");

		var textOffset = 0,
			htmlOffset = 0;
		var highlightRange = [];
		highlightRange[0] = 0;
		var isFirstMatch = true;

		// Scan words in html/text to find matching range
		var html = element.html();
		//console.log("html: " + html);
		var textResult = getNextWord(text,textOffset);
		while (textResult.word != null && textOffset < text.length && htmlOffset < html.length) {
			var htmlResult = getNextWord(html,htmlOffset);
			if (textResult.word == htmlResult.word) {
				textOffset = textResult.offset;
				htmlOffset = htmlResult.offset
				highlightRange[1] = htmlOffset;
				textResult = getNextWord(text,textOffset);
				if (isFirstMatch) {
					// First word match so set initial html offset
					highlightRange[0] = htmlOffset - htmlResult.word.length;
					isFirstMatch = false;
				}
			}else{
				// No match found
				htmlOffset = htmlResult.offset;
				highlightRange[0] = 0;
			}
		}

		html = addHighlights(html,highlightRange);
		element.html(html);
	}

	// Expose privileged methods
    return {
		hightlight : hightlight
    };
}(); // Don't delete the circle brackets...required!

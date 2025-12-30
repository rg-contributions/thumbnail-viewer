/**
 * Thumbnail Viewer
 *
 * @author: Henrique Salvadori Coelho
 *          henriquesc@gmail.com
 *          hcoelho.com
 *
 * The generated DOM elements have the following structure:
 * <div class="thumbnail-viewer-overall">
 *   <figure class="thumbnail-viewer-container">
 *     <img src="" alt="" class="thumbnail-viewer-image" />
 *     <a href="#" alt="Close image" class="thumbnail-viewer-close" />
 *   </figure>
 *   <a href="#" class="thumbnail-viewer-prev">Previous</a>
 *   <a href="#" class="thumbnail-viewer-next">Next</a>
 * </div>
*/
document.addEventListener("DOMContentLoaded", function() {

  // Display settings
  //---------------------------------------------------------------------------
  // The maximum width/height will be multiplied by the following
  // factors. If you want the image to have a maximum width of 80%
  // of the window size, use 0.8
  var widthFactor = 0.8;
  var heightFactor = 0.8;

  // By default, the images will be rendered in the middle of the screen, but
  // you can add an offset to shift it vertically using this value
  var topOffset = 1.0;

  // Finding elements with the class thumbnail-viewer
  var els = document.getElementsByClassName('thumbnail-viewer');
  var dirs = document.getElementsByClassName('directory-viewer');

  function addLabel(element, name) {
    var label = document.createElement('div');
    label.className = 'thumbnail-viewer-label';
    label.innerHTML = name;
    label.style.textAlign = 'center';
    label.style.fontSize = '12px';
    label.style.marginTop = '5px';
    label.style.wordBreak = 'break-all';
    label.style.color = 'inherit';

    element.style.display = 'inline-block';
    element.style.verticalAlign = 'top';
    element.style.textDecoration = 'none';

    element.appendChild(label);
  }

  for (var i = 0; i < els.length; i++) {
    var e = els[i];

    var labelName = '';
    var containedImages = e.getElementsByTagName('img');
    if (containedImages.length > 0 && containedImages[0].alt) {
      labelName = containedImages[0].alt;
    } else {
      var url = e.getAttribute('href');
      if (url) {
        var cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        labelName = decodeURIComponent(cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1));
      }
    }
    
    if (labelName) {
      addLabel(e, labelName);
    }

    (function (element, index) {
      element.addEventListener('click', function (event) {
        event.preventDefault();
        display(index);
      });
    })(e, i);
  }

  for (var j = 0; j < dirs.length; j++) {
    var d = dirs[j];
    var dirName = d.getAttribute('data-name');
    if (dirName) {
      addLabel(d, dirName);
    }
  }

  // Keeping a list of the elements that are visible
  var activeElements = [];
  
  // Keep track of the current resize handler to remove it when closing/switching
  var currentResizeHandler = null;

  if (els === null || els === undefined) { return; }

  if (els.length === 0) {
    var placeholder = document.createElement('div');
    placeholder.innerHTML = 'No images found';
    placeholder.style.textAlign = 'center';
    placeholder.style.marginTop = '100px';
    placeholder.style.fontFamily = 'Helvetica, Arial, sans-serif';
    placeholder.style.color = '#888';
    placeholder.style.fontSize = '24px';
    document.body.appendChild(placeholder);
    return;
  }


  /**
   * Displays the thumbnail
   * @param {Number} index
   */
  function display(index) {
    var element = els[index];
    var url = element.href;
    var alt;
    var containedImages = element.getElementsByTagName('img');
    if (containedImages.length > 0) {
      alt = containedImages[0].alt;
    }

    var overall = getOverall();
    var figure  = getFigure();
    var image   = getImage(url, alt);
    var caption = getCaption(url, alt);
    var close   = getClose();
    var prev    = getPrev(index);
    var next    = getNext(index);

    function reStyle() {
      style(overall, figure, image, caption, close, prev, next);
    }

    // We mount the elements one inside the other, set their
    // display style as hidden (we still have to style them),
    // append the figure in the body, remove other thumbnails
    // that are being displayed (if any), put the new figure
    // in the list of visible elements, style it, and then
    // make it visible
    mount(overall, figure, image, caption, close, prev, next);
    hide(overall);
    document.body.appendChild(overall);
    
    // Clear previous elements and listeners
    clearActiveElements();
    
    activeElements.push(overall);
    reStyle();
    image.addEventListener('load', reStyle);
    
    // Add new resize listener
    currentResizeHandler = reStyle;
    window.addEventListener('resize', reStyle);
    
    show(overall);
  }


  /**
   * Builds the <div> (overall) element
   * @returns {Element}
   */
  function getOverall() {
    const e = document.createElement('div');
    e.className = 'thumbnail-viewer-overall';
    e.addEventListener('click', function (event) {
      if (event.target.className === 'thumbnail-viewer-overall') {
        clearActiveElements();
      }
    });
    return e;
  }


  /**
   * Builds the <figure> element
   * @returns {Element}
   */
  function getFigure() {
    const e = document.createElement('figure');
    e.className = 'thumbnail-viewer-container';
    return e;
  }


  /**
   * Builds the <img> element
   * @param {String} url
   * @param {String} (alt)
   * @returns {Element}
   */
  function getImage(url, alt) {
    const e = document.createElement('img');
    e.className = 'thumbnail-viewer-image';
    e.src = url;
    if (alt !== null && alt !== undefined ) { e.alt = alt; }
    return e;
  }


  /**
   * Builds the <figcaption> element
   * @param {String} url
   * @param {String} (alt)
   * @returns {Element}
   */
  function getCaption(url, alt) {
    const e = document.createElement('figcaption');
    e.className = 'thumbnail-viewer-caption';
    
    if (alt) {
      e.innerHTML = alt;
    } else {
      // Extract filename from URL as fallback
      const filename = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
      e.innerHTML = filename;
    }
    return e;
  }


  /**
   * Builds the <a> element for closing
   * @returns {Element}
   */
  function getClose() {
    const e = document.createElement('a');
    e.className = 'thumbnail-viewer-close';
    e.alt = 'Close image';
    e.href = '#';
    e.innerHTML = 'Close';
    e.addEventListener('click', function (event) {
      event.preventDefault();
      clearActiveElements();
    });
    return e;
  }

  function getPrev(index) {
    if (index > 0) {
      const e = document.createElement('a');
      e.className = 'thumbnail-viewer-prev';
      e.href = '#';
      e.innerHTML = 'Previous';
      e.addEventListener('click', function (event) {
        event.preventDefault();
        display(index - 1);
      });
      return e;
    }
    return null;
  }

  function getNext(index) {
    if (index < els.length - 1) {
      const e = document.createElement('a');
      e.className = 'thumbnail-viewer-next';
      e.href = '#';
      e.innerHTML = 'Next';
      e.addEventListener('click', function (event) {
        event.preventDefault();
        display(index + 1);
      });
      return e;
    }
    return null;
  }


  /**
   * Mounts the elements
   */
  function mount(overall, figure, image, caption, close, prev, next) {
    overall.appendChild(figure);
    figure.appendChild(image);
    figure.appendChild(caption);
    figure.appendChild(close);
    if (prev) overall.appendChild(prev);
    if (next) overall.appendChild(next);
  }


  /**
   * Applies the essential styles to the elements
   */
  function style(overall, figure, image, caption, close, prev, next) {
    // Getting the current width and height of the browser
    var clientWidth  = window.innerWidth;
    var clientHeight = window.innerHeight;

    var clientImageWidth;
    var clientImageHeight;


    // Styling overall
    //-------------------------------------------------------------------------
    
    if (!isNaN(clientHeight)) {
      overall.style.height = clientHeight + 'px';
    }

    overall.style.position = 'fixed';
    overall.style.margin   = 0;
    overall.style.top      = 0;
    overall.style.left     = 0;
    overall.style.width    = '100%';
    overall.style.display  = 'flex';
    overall.style.justifyContent = 'center';
    overall.style.alignItems = 'center';
   
     // Styling image
    //-------------------------------------------------------------------------
    // Calculating the maximum width and height the image can have
    var maxImageWidth  = '';
    var maxImageHeight = '';

    if (!isNaN(clientWidth)) {
      image.style.maxWidth = (clientWidth * widthFactor) + 'px';
    }
    if (!isNaN(clientHeight)) {
      image.style.maxHeight = (clientHeight * heightFactor) + 'px';
    }

    clientImageWidth  = image.clientWidth;
    clientImageHeight = image.clientHeight;

    // Styling figure
    //-------------------------------------------------------------------------
    figure.style.margin = 0;
    figure.style.position = 'relative'; // Relative to flex container
    
    // Apply topOffset if it's not 1.0
    if (topOffset !== 1.0) {
      var verticalShift = (clientHeight / 2) * (topOffset - 1.0);
      figure.style.top = verticalShift + 'px';
    }

    // Styling close button
    //-------------------------------------------------------------------------
    close.style.position = 'absolute';
    close.style.top = 0;
    close.style.right = 0;

    // Styling caption
    //-------------------------------------------------------------------------
    caption.style.textAlign = 'center';
    caption.style.width = '100%';
    caption.style.padding = '10px 0';
    caption.style.color = '#fff';
    caption.style.backgroundColor = 'rgba(0,0,0,0.5)';

    // Styling prev/next buttons
    //-------------------------------------------------------------------------
    if (prev) {
      prev.style.position = 'absolute';
      prev.style.top = '50%';
      prev.style.left = '20px';
      prev.style.marginTop = '-20px'; // Approx center adjustment
    }
    if (next) {
      next.style.position = 'absolute';
      next.style.top = '50%';
      next.style.right = '20px';
      next.style.marginTop = '-20px';
    }
  }


  /**
   * Clears all the elements that are currently being displayed
   */
  function clearActiveElements() {
    for (var i = 0; i < activeElements.length; i++) {
      document.body.removeChild(activeElements[i]);
    }
    activeElements = [];
    
    if (currentResizeHandler) {
      window.removeEventListener('resize', currentResizeHandler);
      currentResizeHandler = null;
    }
  }


  /**
   * Hides a element
   * @param {Element} e
   */
  function hide(e) {
    e.style.visibility = 'hidden';
  }


  /**
   * Shows an element
   * @param {Element} e
   */
  function show(e) {
    e.style.visibility = 'visible';
  }
});

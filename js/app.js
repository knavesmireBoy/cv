   /*var count = 0,
            board = document.querySelector('.him'),
            bolt = document.querySelector('#bolt'),
            main = document.querySelectorAll('main')[0],
            doScroll = function(){
                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            },
            equals = function(pass){
                return function(a, b){
                    return pass ? a !== b : a === b;
                };
            },
            match = function(reg){
                return function(str){
                    return str.match(reg);
                };
            },
            isSub = match(/^DT$/),
            isLink = match(/^A$/);
            
        
        main.addEventListener('click', function(e){
            var tgt = e.target;

            if(tgt.nodeName !== 'A'){
                return;
            }
            if(!tgt.target){
                e.preventDefault();
            var pin = document.getElementById('pinboard');
            if(pin){
                if(e.target.href !== pin.src){
                     pin.src = e.target.href; 
                }
                else {
                    board.removeChild(board.firstChild);
                }
            }
            else {
                var i = document.createElement('img');
                board.appendChild(i);
                i.id = 'pinboard';
                i.src = e.target.href;
            }
            doScroll();
            }            

        });
        
        board.addEventListener('click', function(e){
            e.preventDefault();
               if(document.getElementById('pinboard')){
                board.removeChild(board.firstChild);
            }
            
        });
        
        document.querySelector('dl').addEventListener('click', function(e){            
            if(isSub(e.target.nodeName)){
               var tgt = e.target.nextElementSibling,
                sites = Array.prototype.slice.call(document.querySelectorAll('dd'));
            sites.forEach(function(el){
                if(tgt !== el){
                    el.classList.remove('show');
                }
            });
            tgt.classList.toggle('show');
            }            
        });
           */

var main = document.querySelector('main'),
    doScroll = function(){
                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            },
    deferScroll = function(){
        setTimeout(doScroll, 333);
    };
main.addEventListener('click', function(e){
    var tgt = e.target,
        pic = document.querySelector('.him'),
        pass = (tgt === pic),
        html = document.documentElement,
        src;
    if(tgt.nodeName !== 'A'){
        if(!pass) {
            return;  
        }
    }
    if(tgt.href && tgt.href.indexOf(location.href) < 0){
       return;
    }
    e.preventDefault();
    if(document.documentElement.className === 'js'){
        pic.style.backgroundImage = null;
        html.className = 'no-js';
        deferScroll();
    }
    else if(tgt.className === 'display') {
        document.documentElement.className = 'js';
        src = tgt.getAttribute('href');
        pic.style.backgroundImage = "url(" + src + ")";
        deferScroll();
    }
});
     
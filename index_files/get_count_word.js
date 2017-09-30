function getCountWord(str)
{
    var str = str.replace(/[\.,\?\!\:;%\)\(\+\=\*]+/g,'');
    var arr = str.match(/[^ .*]+/g);

    try {
        return arr.length;
    } catch (e) {
        return 0;
    }
}
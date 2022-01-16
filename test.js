const fs = require('fs');
// const { unlinkSync } = require('fs');
async function mkdir (){
    fs.rm('./img/866653590134718495', { recursive: true });
}

mkdir()
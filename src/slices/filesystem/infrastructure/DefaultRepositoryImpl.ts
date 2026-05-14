import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import { NodeFactory } from '../application/services/NodeFactory';

export class DefaultRepositoryImpl {
    constructor(
        private fs: FileSystem, 
    ) { }

    public loadDefaults() {
        this.fs.root = NodeFactory.create('/', 'dir', 'root');
        this.fs.currentDirectory = this.fs.root;

        this.fs.mkdir("home");
        this.fs.mkdir("bin");
        this.fs.mkdir("etc");
        this.fs.mkdir("var");
        this.fs.writeFile("/etc/passwd", "root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash");
        this.fs.writeFile("/etc/group", "root:x:0:\nsudo:x:27:guest,nico\n");
        this.fs.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
    }

    public saveDefaults(){
        return 'this.fs is a free plan. Upgrade to Pro to enable savestates.'
    }

}
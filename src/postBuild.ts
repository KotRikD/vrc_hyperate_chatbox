import fs from 'fs';
import path from 'path';
import { load } from 'resedit/cjs';

async function windowsPostBuild(output) {
    const ResEdit = await load();
    const exe = ResEdit.NtExecutable.from(fs.readFileSync(output));
    const res = ResEdit.NtExecutableResource.from(exe);

    const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];

    vi.setStringValues(
        { lang: 1033, codepage: 1200 },
        {
            ProductName: 'hyperate to vrc osc monitor',
            FileDescription: 'A dumb util to send hyperate heartbeat to VRChat OSC',
            CompanyName: 'KotRik',
            LegalCopyright: `MIT License.`
        }
    );
    vi.setFileVersion(1, 0, 0, 0, 1033);
    vi.setProductVersion(1, 0, 0, 0, 1033);
    vi.outputToResourceEntries(res.entries);
    res.outputResource(exe);
    fs.writeFileSync(output, Buffer.from(exe.generate()));
}

if (process.platform === 'win32') {
    windowsPostBuild(path.join(__dirname, '../', './dist/vrc_hyperrate_chatbox.exe'));
}
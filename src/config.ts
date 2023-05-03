import * as dotenv from 'dotenv';
import * as fs from 'fs';

const curDir = fs.readdirSync('./');
if (!curDir.includes('soft.env')) {
    fs.writeFileSync(
        './soft.env',
        `HYPERATE_WIDGET_URL=https://app.hyperate.io/number
TEXT=Heartrate {} BPM`
    );
    process.exit(0)
}

dotenv.config({
    path: 'soft.env'
});

export const config = {
    hyperateWidgetUrl: process.env.HYPERATE_WIDGET_URL || '',
    hyperateText: process.env.TEXT || ''
};

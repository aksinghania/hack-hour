import { app } from "../../../lib/bolt.js";
import { Commands, Callbacks, Actions, Environment } from "../../../lib/constants.js";
import { emitter } from "../../../lib/emitter.js";
import { prisma } from "../../../lib/prisma.js";
import { informUser } from "../lib/lib.js";
import { Stats } from "../views/stats.js";

app.action(Actions.VIEW_STATS, async ({ ack, body }) => {
    try {
        const slackId = body.user.id;

        await ack();

        const user = await prisma.user.findFirst({
            where: {
                slackUser: {
                    slackId
                }
            }
        });

        if (!user) {
            informUser(slackId, `Run \`${Commands.HACK}\`!`, Environment.MAIN_CHANNEL, (body as any).message.ts);
            return;
        }

        await app.client.views.open({
            trigger_id: (body as any).trigger_id,
            view: await Stats.stats(user.id),
        });
    } catch (error) {
        emitter.emit("error", error);
    }
});

app.command(Commands.STATS, async ({ ack, command, client }) => {
    try {
        const slackId = command.user_id;

        await ack();

        const user = await prisma.user.findFirst({
            where: {
                slackUser: {
                    slackId
                }
            }
        });

        if (!user) {
            informUser(slackId, `Run \`${Commands.HACK}\`!`, command.channel_id);
            return;
        }

        await client.views.open({
            trigger_id: command.trigger_id,
            view: await Stats.stats(user.id),            
        });
    } catch (error) {
        emitter.emit("error", error);
    }
});

app.view(Callbacks.STATS, async ({ ack }) => {
    try {
        await ack();
    } catch (error) {
        emitter.emit("error", error);
    }
});
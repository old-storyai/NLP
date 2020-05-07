import ContextAnalyser from 'meaning/contextAnalyser';

const ca = new ContextAnalyser();

it('should succeed', () => {
    // new ContextAnalyser('Do I have any Intercom messages from high value customers waiting for a reply?').createGroups();
    new ContextAnalyser('Send me a message tomorrow at 6PM').createGroups();
    new ContextAnalyser('Send me a message 1 week from now').createGroups();
    new ContextAnalyser('Send me a message 9 thousand week from now').createGroups();
    // new ContextAnalyser('show me my customers sorted by broccoli').createGroups();
    // new ContextAnalyser('Also, send me a Slack message when a high value customer has an open ticket for A long time.').createGroups();
    // new ContextAnalyser('Do we have any outstanding invoices for this Salesforce account?').createGroups();
    // new ContextAnalyser('Give a call to the 1st minister as soon as I get home').createGroups();
});


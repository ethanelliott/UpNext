const cors = () => {
    return (req: any, res: { header: { (arg0: string, arg1: string): void; (arg0: string, arg1: string): void; }; }, next: () => void) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    };
};

export default cors;

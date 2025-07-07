const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    const year = date.getUTCFullYear();
    const month = months[date.getUTCMonth()];
    const day = String(date.getUTCDate()).padStart(2, '0');

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year} ${month} ${day} , ${hours}:${minutes}:${seconds}`;
};

const BuildInfo = () => {
    return (
        <div>
            Build {formatDateTime(__BUILD_DATE__)}
        </div>
    );
};



export default BuildInfo;

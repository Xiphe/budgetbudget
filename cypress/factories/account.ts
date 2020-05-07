import { InteropAccount, Account } from '../../src/moneymoney/Types';
import { DeepPartial } from './DeepPartial';
import faker from 'faker';

const SOME_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAHhlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAACCgAwAEAAAAAQAAACAAAAAAfgvaUgAAAAlwSFlzAAAWJQAAFiUBSVIk8AAABIRJREFUWAntVltvVFUUXuucqWWG0VHTgRY7rTaxVhqCAWNM6yXBxKCpIZRAOv/FBx79I2Qq0Rff5AlDTIMaHVogGmxaW9uRIjxAp+102r391r6c2XNaqhLQF3ZyZq2z1+1bl73PED1dTyvwP1eA7y9TF9eJ/2scz75KdyRmhtY7X2yoxhlNNE7Eb2rSQPPP8HhdoWYJEVP3ysykNfyByvK8UD1HWX6FNtoi3f01W9pWjXHSDDB6FHqxsfQ/2IA38WR2dgTAbhA/4duCOF/Fzj4AmN/glV/ij4uD715ivrzl4wh9cCtfrKvGqUjrM0rrE9h6JpQ/Eh9U6GC2ZAHUbmZk+y5r/iKOdKVr6NMrzOdVGODe7AuFZrM+ppRCZegkSpwzcp+uS1Fa59sics8nLTJG9qc722sBLN/okLqaXdOjKFoiUhc57qj0vLb2fWBjdRZ7sysPVk7CaByVGYPt8xLKrnZEYc9FHrasJ3fIAli63umtnZMWgWA2Iq4wZyZ7hldvtCSW0/p4R+3n6ydIYWY0nUKmB9M64XsI6KW8A7A4DQBuSkNlw7cP3QzHXMnENNk9tDGX1tX6fFS7+dmoMgNMpxGsP60Tvvfmu20FFqazSQXaCxiqW14UbbP4KrGu7Iv5YvHwWm2nJtHydO64YhpHVaQ6Q6ITVqD0nAPwWzUnB3/35SN6iCmEEbNSmi5HHE1SzF+Whu/f283R8kz+9aZS1wCkw8SCv77CAVuB+ep+vHoE6Yi7uXvoXpM5+jpiVemMc18dGL6zGmrOX9u/jvtlnx1Ypv5ClwGAYx6RwqGTx/NCLS83mcjZPJ5/iLxjW+mx5hZfqG+u356r5j9fqBY+TEBo8dV65p0gYzZdBaRHRBJcqCzPR/YV26ZfXgw7q+oq6Paxl4PiuW3SJRheEmOtkAgEqJLx7zxSRjJP7mo4tG22Dj3v3JPcTsILNUuiB1dzwienKkFqKyzBMTQE6hcq0Hox2SCCodBAxSRlS51Fy6VsiLKjQjzvlCRbv+SzYivrbawE97Avo93wwc1bOmWfrc9wRwVgJcEFuCzMjl8avE8okUOYqoD0SADZFEw80yLnJpWhzIgtl8vU2EmGrgRBJG3myWWUyA2AMKBMvB0UCen1PHUwEmI/NuirrT0MEFySNqlKq1stGHzrz2xiaBh7ZUTANMYcXyCKV3GNQiTTimMnD4QJFT71kDvCQuWRLD21GYu/vVeisYivXL229QkqUGZNHyEr85UyCe3toyX1/Xcd4IinDr99e6SlsJNLAISi2R8GChvNNfmglKHwAfzZf0apALbcsHRe0v8HUI6p4ZFHABCCufVjd7GxTmcRpYxA+JsmfbIRZVjbh9bOk79XBMCR0T/+fQVCACE/892hktqkCZyOCQQ/tkvGrhy2B7gHAGDp8QEIwVSvDgzGW5tlXK8TmL4dn1vRlRk4+s4TAhCC+enbl9/g7a0ymjOBY9NnrmQo4ExMHX3v9ydTgRCA52U+qlf6R0An0J5zaMTssfcX9gTgbR871fpsPP3NwJG/c/wXFNVRV0l7qZQAAAAASUVORK5CYII=';

export default function createAccount({
  balance = faker.random.number(),
  currency = 'EUR',
  ...rest
}: DeepPartial<Account & { currency: string }> = {}): InteropAccount {
  return {
    accountNumber: faker.finance.account(),
    balance: [[balance, currency]],
    currency,
    group: false,
    icon: SOME_ICON,
    indentation: 0,
    name: faker.finance.accountName(),
    portfolio: false,
    uuid: faker.random.uuid(),
    ...rest,
  };
}

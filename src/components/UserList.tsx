import React, {FC} from 'react'
import {
    useReactTable,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
} from '@tanstack/react-table'

import {User} from "../shared/User";
import UserItem from "./UserItem";
import arrowForward from "../assets/arrow-forward.svg";
import arrowBack from "../assets/arrow-back.svg";
import {ArrowForwardIcon, SearchIcon} from "./SVGIcons";


interface UserListProps {
    users: User[]
}

const UserList: FC<UserListProps> = ({users}) => {

    const columns = React.useMemo<ColumnDef<User, any>[]>(
        () => [
            {
                header: 'Account',
                footer: props => props.column.id,
                accessorKey: 'account',
            },
            {
                header: 'Mail',
                footer: props => props.column.id,
                accessorKey: 'mail',
            },
            {
                header: 'Admin',
                footer: props => props.column.id,
                accessorKey: 'isAdmin',
            },
        ],
        []
    )


    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div>
            <div className="search-bar-div row center">
                <SearchIcon />
                <input type="text" className="search-bar-input" placeholder="Search a user..." onChange={e => table.setGlobalFilter(e.target.value)}/>
            </div>

            <table>
                <colgroup>
                    <col span={1} style={{width: "30%"}}/>
                    <col span={1} style={{width: "50%"}}/>
                    <col span={1} style={{width: "20%"}}/>
                </colgroup>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
                            return (
                                <th key={header.id} colSpan={header.colSpan}>
                                    {header.isPlaceholder ? null : (
                                        <>
                                            <div
                                                className="row center"
                                                {...{
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: <div className="table-filter-icon rotate90"><ArrowForwardIcon /></div>,
                                                    desc: <div className="table-filter-icon rotate270"><ArrowForwardIcon/></div>,
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        </>
                                    )}
                                </th>
                            )
                        })}
                    </tr>
                ))}
                </thead>

                <tbody>
                {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map(row => {
                    return (
                        <UserItem user={row.original} key={row.id}/>
                    )
                }) : <tr><td colSpan={3}>No users found</td></tr>}
                </tbody>
            </table>
            {table.getPageCount() > 1 &&
            <div className="row center small-gap">
                <button
                    className="hour clickable-hour"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    title="Previous page"
                >
                    <img src={arrowBack} style={{width: "20px"}} alt=""/>
                </button>

                <button
                    className="hour clickable-hour"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    title="Next page"
                >
                    <img src={arrowForward} style={{width: "20px"}} alt=""/>
                </button>

                <span>
                      <div>Page</div>
                      <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                          {table.getPageCount()}
                      </strong>
                </span>

                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>

            </div>}

            <div>Total : <strong>{users.length}</strong> users</div>
        </div>
    )
}

export default UserList;
